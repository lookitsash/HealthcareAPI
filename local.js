(() => {
    require('dotenv').config();

    const { ApiResponseSchema } = require('./schemas/apiResponse');
    const { EnvironmentSchema } = require('./schemas/environment');

    const env = EnvironmentSchema.parse(process.env);
    const {
        API_KEY,
        API_URL,
        VERBOSE,
        RETRY_DELAY,
        RETRY_MAX,
        PAGING_DELAY,
        PAGING_LIMIT
    } = env;

    const axios = require('axios');

    const delay = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const verbose = (message) => {
        if (VERBOSE) console.log(message);
    }

    const getPatients = async (page = 1) => {
        for (let retries = 0; retries <= RETRY_MAX; retries++) {
            try {
                const url = `${API_URL}/patients?page=${page}&limit=${PAGING_LIMIT}`;
                if (retries) verbose(`\nRetry attempt ${retries} / ${RETRY_MAX}`);
                verbose(`Fetching url ${url}`);
                const response = await axios.get(url, { headers: { "x-api-key": API_KEY } });
                verbose(`Response: ${JSON.stringify(response.data)}\n`);

                const parsed = ApiResponseSchema.safeParse(response.data);
                if (!parsed.success) {
                    throw `Invalid API response: ${JSON.stringify(parsed.error,null,2)}`;
                }

                let patients = response.data.data;
                if (response.data.pagination.hasNext) {
                    await delay(PAGING_DELAY);
                    patients = patients.concat(await getPatients(page+1));
                }
                return patients;        
            }
            catch (error) {
                if (error.response?.status) {
                    verbose(`${error.toString()}`);
                }
                else throw error;
            }
            verbose(`Retrying in ${RETRY_DELAY} ms`)
            await delay(RETRY_DELAY);
        }
    }

    const getAlertList = async (allPatients) => {
        try {
            const dataValidation = {
                bloodPressure: (value) => {
                    const bpArr = value?.split('/');
                    if (bpArr && bpArr.length == 2) {
                        const bpSystolic = parseInt(bpArr[0]);
                        const bpDiastolic = parseInt(bpArr[1]);
                        return bpSystolic > 0 && bpDiastolic > 0;
                    }
                    return false;
                },
                temperature: (value) => {
                    const temperature = parseFloat(value);
                    return temperature > 0;
                },
                age: (value) => {
                    const age = parseInt(value);
                    return age > 0;                    
                }
            }

            const highRiskPatientIDs = [];
            const feverPatientIDs = [];
            const dataQualityPatientIDs = [];

            allPatients.forEach((patient) => {
                let dataQualityIssue = false;
                const riskScore = {
                    bloodPressure: 0,
                    temperature: 0,
                    age: 0,
                    totalRisk: () => { return riskScore.bloodPressure + riskScore.temperature + riskScore.age; }
                }

                if (dataValidation.bloodPressure(patient.blood_pressure)) {
                    const bpArr = patient.blood_pressure.split('/');
                    const bpSystolic = parseInt(bpArr[0]);
                    const bpDiastolic = parseInt(bpArr[1]);
                    if (bpSystolic < 120 && bpDiastolic < 80) riskScore.bloodPressure = 0;
                    if (bpSystolic >= 120 && bpSystolic <= 129 && bpDiastolic < 80) riskScore.bloodPressure = 1;
                    if ((bpSystolic >= 130 && bpSystolic <= 139) || (bpDiastolic >= 80 && bpDiastolic <= 89)) riskScore.bloodPressure = 2;
                    if (bpSystolic >= 140 || bpDiastolic >= 90) riskScore.bloodPressure = 3;
                }
                else dataQualityIssue = true;

                if (dataValidation.temperature(patient.temperature)) {
                    if (patient.temperature <= 99.5) riskScore.temperature = 0;
                    else if (patient.temperature >= 99.6 && patient.temperature <= 100.9) riskScore.temperature = 1;
                    else if (patient.temperature >= 101) riskScore.temperature = 2;
                }
                else dataQualityIssue = true;

                if (dataValidation.age(patient.age)) {
                    if (patient.age < 40) riskScore.age = 0;
                    else if (patient.age >= 40 && patient.age <= 65) riskScore.age = 1;
                    else if (patient.age > 65) riskScore.age = 2;
                }
                else dataQualityIssue = true;

                if (riskScore.totalRisk() >= 4) highRiskPatientIDs.push(patient.patient_id);
                if (riskScore.temperature >= 1) feverPatientIDs.push(patient.patient_id);
                if (dataQualityIssue) dataQualityPatientIDs.push(patient.patient_id);

                // verbose(`${JSON.stringify(riskScore)}: ${riskScore.totalRisk()}   BP: ${patient.blood_pressure}, TEMP: ${patient.temperature}, AGE: ${patient.age}`);
            });

            return {
                highRiskPatientIDs,
                feverPatientIDs,
                dataQualityPatientIDs
            }           
        }
        catch (error) {
            verbose(`getAlertList error: ${error}`);
        }
    }

    const submitAssessment = async (alertList) => {
        const url = `${API_URL}/submit-assessment`;
        const response = await axios.post(url, { high_risk_patients: alertList.highRiskPatientIDs, fever_patients: alertList.feverPatientIDs, data_quality_issues: alertList.dataQualityPatientIDs }, { headers: { "x-api-key": API_KEY } });
        return response.data;
    }

    const processData = async () => {
        try {
            const allPatients = await getPatients();
            verbose(`Total patients found: ${allPatients.length}`);

            if (allPatients.length) {
                const alertList = await getAlertList(allPatients);
                verbose(`alertList: ${JSON.stringify(alertList)}`);

                const assessmentResults = await submitAssessment(alertList);
                console.log(`assessmentResults: ${JSON.stringify(assessmentResults,null,2)}`);
            }
            else console.log(`No patients found`);
        }
        catch (error) {
            console.log(`processData error: ${error.toString()}`)
        }
    }

    return {
        processData
    }
})().processData();