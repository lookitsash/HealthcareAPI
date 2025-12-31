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
                    //console.log(parsed.error.format());
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

    const delay = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const verbose = (message) => {
        if (VERBOSE) console.log(message);
    }

    const getAlertList = async () => {
        try {
            //const patients = await getPatients();
            const allPatients = [{"patient_id":"DEMO001","name":"TestPatient, John","age":45,"gender":"M","blood_pressure":"120/80","temperature":98.6,"visit_date":"2024-01-15","diagnosis":"Sample_Hypertension","medications":"DemoMed_A 10mg, TestDrug_B 500mg"},{"patient_id":"DEMO002","name":"AssessmentUser, Jane","age":67,"gender":"F","blood_pressure":"140/90","temperature":99.2,"visit_date":"2024-01-16","diagnosis":"Eval_Diabetes","medications":"FakeMed 1000mg"},{"patient_id":"DEMO003","name":"SkillsTest, Bob","age":34,"gender":"M","blood_pressure":"110/70","temperature":98.4,"visit_date":"2024-01-17","diagnosis":"Routine_Checkup","medications":"n/a"},{"patient_id":"DEMO004","name":"CodeChallenge, Alice","age":52,"gender":"F","blood_pressure":"INVALID_BP_FORMAT","temperature":99.1,"visit_date":"2024-01-18","diagnosis":"Test_Hypertension","medications":"AssessmentDrug 20mg"},{"patient_id":"DEMO005","name":"DataTest, Charlie","age":28,"gender":"M","blood_pressure":"N/A","temperature":101.8,"visit_date":"2024-01-19","diagnosis":"Fever_Assessment","medications":"TestFlu 75mg"},{"patient_id":"DEMO006","name":"EdgeCase, Diana","age":73,"gender":"F","blood_pressure":"130/85","temperature":96.2,"visit_date":"2024-01-20","diagnosis":"Elderly_Checkup","medications":"DemoAspirin 81mg daily"},{"patient_id":"DEMO007","name":"ErrorTest, Frank","age":41,"gender":"M","blood_pressure":"150/95","temperature":"TEMP_ERROR","visit_date":"2024-01-21","diagnosis":"High_Fever","medications":"TestAntibiotic 500mg TID"},{"patient_id":"DEMO008","name":"BoundaryCase, Grace","age":59,"gender":"F","blood_pressure":"125/82","temperature":102.3,"visit_date":"2024-01-22","diagnosis":"Severe_Fever","medications":"AssessmentMed 850mg BID"},{"patient_id":"DEMO009","name":"StressTest, Henry","age":36,"gender":"M","blood_pressure":"135/88","temperature":100.1,"visit_date":"2024-01-23","diagnosis":"Mild_Fever","medications":"DemoMed 50mg"},{"patient_id":"DEMO010","name":"FinalTest, Ivy","age":48,"gender":"F","blood_pressure":"145/92","temperature":98.1,"visit_date":"2024-01-24","diagnosis":"Assessment_Complete","medications":"n/a"},{"patient_id":"DEMO012","name":"ExtremeCase, Mary","age":89,"gender":"F","blood_pressure":"180/110","temperature":103.2,"visit_date":"2024-01-25","diagnosis":"Critical_Assessment","medications":"MaxDose 100mg QID"},{"patient_id":"DEMO013","name":"Normal, Sarah","age":32,"gender":"F","blood_pressure":"118/78","temperature":98.7,"visit_date":"2024-01-26","diagnosis":"Annual_Physical","medications":"Multivitamin daily"},{"patient_id":"DEMO014","name":"Healthy, Mike","age":29,"gender":"M","blood_pressure":"115/75","temperature":98.3,"visit_date":"2024-01-27","diagnosis":"Sports_Physical","medications":"n/a"},{"patient_id":"DEMO015","name":"Athlete, Lisa","age":26,"gender":"F","blood_pressure":"108/68","temperature":97.9,"visit_date":"2024-01-28","diagnosis":"Pre_Competition","medications":"Protein supplements"},{"patient_id":"DEMO016","name":"Hypertensive, Robert","age":55,"gender":"M","blood_pressure":"160/100","temperature":98.5,"visit_date":"2024-01-29","diagnosis":"Stage2_Hypertension","medications":"Lisinopril 20mg, Hydrochlorothiazide 25mg"},{"patient_id":"DEMO017","name":"Borderline, Karen","age":49,"gender":"F","blood_pressure":"139/89","temperature":98.8,"visit_date":"2024-01-30","diagnosis":"Stage1_Hypertension","medications":"Amlodipine 5mg"},{"patient_id":"DEMO018","name":"Elevated, Tom","age":42,"gender":"M","blood_pressure":"128/75","temperature":99,"visit_date":"2024-01-31","diagnosis":"Elevated_BP","medications":"Lifestyle modifications"},{"patient_id":"DEMO019","name":"Senior, Betty","age":78,"gender":"F","blood_pressure":"155/95","temperature":97.8,"visit_date":"2024-02-01","diagnosis":"Geriatric_Care","medications":"Multiple daily meds"},{"patient_id":"DEMO020","name":"Elderly, Walter","age":82,"gender":"M","blood_pressure":"165/88","temperature":98.1,"visit_date":"2024-02-02","diagnosis":"Hypertension_Elderly","medications":"Losartan 100mg, Metoprolol 50mg"},{"patient_id":"DEMO021","name":"Fever, Amanda","age":35,"gender":"F","blood_pressure":"125/80","temperature":101.5,"visit_date":"2024-02-03","diagnosis":"Viral_Infection","medications":"Acetaminophen 650mg"},{"patient_id":"DEMO022","name":"LowTemp, David","age":68,"gender":"M","blood_pressure":"140/85","temperature":96.8,"visit_date":"2024-02-04","diagnosis":"Hypothermia_Risk","medications":"Warming protocol"},{"patient_id":"DEMO023","name":"Problematic, Carol","age":54,"gender":"F","blood_pressure":"150/","temperature":99.7,"visit_date":"2024-02-05","diagnosis":"Incomplete_Data","medications":"Unknown dosage"},{"patient_id":"DEMO024","name":"Inconsistent, Mark","age":43,"gender":"M","blood_pressure":"/95","temperature":98.6,"visit_date":"2024-02-06","diagnosis":"Data_Entry_Error","medications":"Correcting records"},{"patient_id":"DEMO025","name":"Young, Emma","age":22,"gender":"F","blood_pressure":"110/65","temperature":98.4,"visit_date":"2024-02-07","diagnosis":"College_Physical","medications":"Birth control"},{"patient_id":"DEMO026","name":"Student, Alex","age":19,"gender":"M","blood_pressure":"115/70","temperature":98.9,"visit_date":"2024-02-08","diagnosis":"School_Required","medications":"Allergy medication"},{"patient_id":"DEMO027","name":"Diabetic, Helen","age":61,"gender":"F","blood_pressure":"148/92","temperature":99.3,"visit_date":"2024-02-09","diagnosis":"Type2_Diabetes","medications":"Metformin 1000mg BID, Insulin"},{"patient_id":"DEMO028","name":"Prediabetic, James","age":58,"gender":"M","blood_pressure":"142/88","temperature":98.2,"visit_date":"2024-02-10","diagnosis":"Prediabetes","medications":"Lifestyle changes"},{"patient_id":"DEMO029","name":"Pregnant, Maria","age":31,"gender":"F","blood_pressure":"130/82","temperature":99.1,"visit_date":"2024-02-11","diagnosis":"Prenatal_Care","medications":"Prenatal vitamins"},{"patient_id":"DEMO030","name":"Expecting, Jennifer","age":28,"gender":"F","blood_pressure":"125/78","temperature":98.8,"visit_date":"2024-02-12","diagnosis":"Pregnancy_Checkup","medications":"Folic acid"},{"patient_id":"DEMO031","name":"Severe, Richard","age":66,"gender":"M","blood_pressure":"190/120","temperature":98.7,"visit_date":"2024-02-13","diagnosis":"Hypertensive_Crisis","medications":"Emergency protocol"},{"patient_id":"DEMO032","name":"Critical, Nancy","age":72,"gender":"F","blood_pressure":"200/110","temperature":99.4,"visit_date":"2024-02-14","diagnosis":"Malignant_Hypertension","medications":"ICU admission"},{"patient_id":"DEMO033","name":"Cardiac, Paul","age":69,"gender":"M","blood_pressure":"152/95","temperature":98.3,"visit_date":"2024-02-15","diagnosis":"Heart_Disease","medications":"Carvedilol 25mg, Aspirin 81mg"},{"patient_id":"DEMO034","name":"Arrhythmia, Linda","age":64,"gender":"F","blood_pressure":"138/86","temperature":98.9,"visit_date":"2024-02-16","diagnosis":"Atrial_Fibrillation","medications":"Warfarin 5mg, Digoxin 0.25mg"},{"patient_id":"DEMO035","name":"Nullish, George","age":null,"gender":"M","blood_pressure":"145/90","temperature":98.6,"visit_date":"2024-02-17","diagnosis":"Missing_Age","medications":"Age verification needed"},{"patient_id":"DEMO036","name":"Undefined, Susan","age":47,"gender":"F","temperature":99.2,"visit_date":"2024-02-18","diagnosis":"Equipment_Malfunction","medications":"Recheck vitals"},{"patient_id":"DEMO037","name":"HighFever, Chris","age":39,"gender":"M","blood_pressure":"120/78","temperature":104.1,"visit_date":"2024-02-19","diagnosis":"Severe_Fever","medications":"Antipyretics, IV fluids"},{"patient_id":"DEMO038","name":"Septic, Rachel","age":57,"gender":"F","blood_pressure":"88/55","temperature":102.8,"visit_date":"2024-02-20","diagnosis":"Sepsis","medications":"Antibiotics, Pressors"},{"patient_id":"DEMO039","name":"MiddleAge, Kevin","age":45,"gender":"M","blood_pressure":"132/84","temperature":98.5,"visit_date":"2024-02-21","diagnosis":"Routine_Screening","medications":"Statin therapy"},{"patient_id":"DEMO040","name":"Mature, Barbara","age":52,"gender":"F","blood_pressure":"144/89","temperature":98.7,"visit_date":"2024-02-22","diagnosis":"Menopause_Care","medications":"HRT therapy"},{"patient_id":"DEMO041","name":"VeryOld, Ernest","age":95,"gender":"M","blood_pressure":"175/85","temperature":97.2,"visit_date":"2024-02-23","diagnosis":"Centenarian_Care","medications":"Comfort measures"},{"patient_id":"DEMO042","name":"Teen, Ashley","age":17,"gender":"F","blood_pressure":"108/62","temperature":98.8,"visit_date":"2024-02-24","diagnosis":"Adolescent_Care","medications":"Acne treatment"},{"patient_id":"DEMO043","name":"StringAge, William","age":"fifty-three","gender":"M","blood_pressure":"156/94","temperature":99,"visit_date":"2024-02-25","diagnosis":"Data_Entry_Error","medications":"Age correction needed"},{"patient_id":"DEMO044","name":"noissue, Lisa","age":29,"gender":"F","blood_pressure":"119/76","temperature":98.4,"visit_date":"2024-02-26","diagnosis":"noissue","medications":"Validation required"},{"patient_id":"DEMO045","name":"PolyPharmacy, Harold","age":76,"gender":"M","blood_pressure":"168/98","temperature":98.1,"visit_date":"2024-02-27","diagnosis":"Multiple_Conditions","medications":"Lisinopril 20mg, Metformin 1000mg, Atorvastatin 40mg, Aspirin 81mg, Metoprolol 100mg"},{"patient_id":"DEMO046","name":"NoMeds, Kelly","age":24,"gender":"F","blood_pressure":"112/68","temperature":98.6,"visit_date":"2024-02-28","diagnosis":"Healthy_Young_Adult","medications":"n/a"},{"patient_id":"DEMO047","name":"LastTest, Morgan","age":38,"gender":"F","blood_pressure":"127/79","temperature":99.9,"visit_date":"2024-03-01","diagnosis":"Borderline_Fever","medications":"Monitor symptoms"},{"patient_id":"DEMO048","name":"FinalCase, Brian","age":44,"gender":"M","blood_pressure":"141/91","temperature":98.2,"visit_date":"2024-03-02","diagnosis":"Final_Assessment","medications":"Follow-up required"}];
            console.log("getAlertList: " + JSON.stringify(allPatients));

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

                if (dataQualityIssue) {
                    dataQualityPatientIDs.push(patient.patient_id);
                    console.log(`DATA ISSUE: ${JSON.stringify(patient)}`);
                }

                console.log(`${JSON.stringify(riskScore)}: ${riskScore.totalRisk()}   BP: ${patient.blood_pressure}, TEMP: ${patient.temperature}, AGE: ${patient.age}`);
            });

            console.log(`dataQualityPatientIDs: ${JSON.stringify(dataQualityPatientIDs)}`);

            /*
            const bloodPressureRiskPatientIDs = allPatients.filter((a) => {
                return a.age == 45;
            }).map((a) => a.patient_id);
            console.log(`bloodPressureRiskPatientIDs: ${JSON.stringify(bloodPressureRiskPatientIDs)}`);
            */

            
        }
        catch (error) {
            verbose(`getAlertList error: ${error}`);
        }
    }

    return {
        getAlertList
    }
})().getAlertList();