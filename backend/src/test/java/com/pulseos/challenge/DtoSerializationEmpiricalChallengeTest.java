package com.pulseos.challenge;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseos.appointment.AppointmentDTOs.*;
import com.pulseos.billing.BillingDTOs.*;
import com.pulseos.doctor.DoctorDTOs.*;
import com.pulseos.laboratory.LabDTOs.*;
import com.pulseos.patient.PatientDTOs.*;
import com.pulseos.pharmacy.PharmacyDTOs.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("demo")
public class DtoSerializationEmpiricalChallengeTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.pulseos.patient.PatientController patientController;

    @Autowired
    private com.pulseos.appointment.AppointmentController appointmentController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUpMockMvc() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(patientController, appointmentController)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .setControllerAdvice(new com.pulseos.common.GlobalExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("Challenge Category 1: Single-Source-of-Truth Memory Layout (Zero Duplicate Fields)")
    class SingleSourceOfTruthMemoryLayoutTests {

        private List<String> getDeclaredFieldNames(Class<?> clazz) {
            return Arrays.stream(clazz.getDeclaredFields())
                    .map(Field::getName)
                    .collect(Collectors.toList());
        }

        @Test
        @DisplayName("PatientResponse must contain canonical fields only - NO duplicate synonym fields")
        void testPatientResponseFieldUniqueness() {
            List<String> fields = getDeclaredFieldNames(PatientResponse.class);
            assertThat(fields).contains("nicPassportNo", "contactNumber", "dateOfBirth", "id");
            assertThat(fields).doesNotContain("nicPassport", "phoneNumber", "dob", "patientId", "personId", "status");
        }

        @Test
        @DisplayName("PatientRequest must contain canonical fields only - NO duplicate synonym fields")
        void testPatientRequestFieldUniqueness() {
            List<String> fields = getDeclaredFieldNames(PatientRequest.class);
            assertThat(fields).contains("nicPassportNo", "contactNumber", "dateOfBirth");
            assertThat(fields).doesNotContain("nicPassport", "phoneNumber", "phone", "dob");
        }

        @Test
        @DisplayName("AppointmentResponse must contain canonical fields only - NO duplicate synonym fields")
        void testAppointmentResponseFieldUniqueness() {
            List<String> fields = getDeclaredFieldNames(AppointmentResponse.class);
            assertThat(fields).contains("appointmentTime", "reasonForVisit", "id");
            assertThat(fields).doesNotContain("startTime", "symptomsReason", "appointmentId");
        }

        @Test
        @DisplayName("AppointmentRequest must contain canonical fields only - NO duplicate synonym fields")
        void testAppointmentRequestFieldUniqueness() {
            List<String> fields = getDeclaredFieldNames(AppointmentRequest.class);
            assertThat(fields).contains("appointmentTime", "reasonForVisit");
            assertThat(fields).doesNotContain("startTime", "symptomsReason");
        }

        @Test
        @DisplayName("DoctorResponse must contain canonical fields only - NO duplicate synonym fields")
        void testDoctorResponseFieldUniqueness() {
            List<String> fields = getDeclaredFieldNames(DoctorResponse.class);
            assertThat(fields).contains("doctorLicenseNo", "contactNumber", "id");
            assertThat(fields).doesNotContain("licenseNo", "licenseNumber", "phoneNumber", "employeeId");
        }

        @Test
        @DisplayName("Billing InvoiceResponse and InvoiceItemResponse must contain zero duplicate fields")
        void testBillingDtoFieldUniqueness() {
            List<String> invoiceFields = getDeclaredFieldNames(InvoiceResponse.class);
            assertThat(invoiceFields).contains("id", "paymentStatus");
            assertThat(invoiceFields).doesNotContain("invoiceId", "status");

            List<String> itemFields = getDeclaredFieldNames(InvoiceItemResponse.class);
            assertThat(itemFields).contains("totalPrice");
            assertThat(itemFields).doesNotContain("subtotal");
        }

        @Test
        @DisplayName("LabDTOs must contain zero duplicate fields")
        void testLabDtoFieldUniqueness() {
            List<String> catalogFields = getDeclaredFieldNames(LabCatalogResponse.class);
            assertThat(catalogFields).contains("price");
            assertThat(catalogFields).doesNotContain("standardFee");

            List<String> requestFields = getDeclaredFieldNames(LabRequestResponse.class);
            assertThat(requestFields).contains("id", "sampleType");
            assertThat(requestFields).doesNotContain("testId", "specimenType");

            List<String> orderFields = getDeclaredFieldNames(LabOrderRequest.class);
            assertThat(orderFields).contains("testCatalogId");
            assertThat(orderFields).doesNotContain("labTestId");

            List<String> resultFields = getDeclaredFieldNames(LabResultRequest.class);
            assertThat(resultFields).contains("clinicalRemarks");
            assertThat(resultFields).doesNotContain("technicianNotes", "remarks");
        }

        @Test
        @DisplayName("PharmacyDTOs must contain zero duplicate fields")
        void testPharmacyDtoFieldUniqueness() {
            List<String> drugFields = getDeclaredFieldNames(DrugResponse.class);
            assertThat(drugFields).contains("id");
            assertThat(drugFields).doesNotContain("drugId");

            List<String> itemRespFields = getDeclaredFieldNames(PrescriptionItemResponse.class);
            assertThat(itemRespFields).contains("drugId", "prescribedQuantity", "dispensedQuantity");
            assertThat(itemRespFields).doesNotContain("id", "prescribedQty", "dispensedQty");

            List<String> rxRespFields = getDeclaredFieldNames(PrescriptionResponse.class);
            assertThat(rxRespFields).contains("id", "prescriptionDate", "doctorInstructions");
            assertThat(rxRespFields).doesNotContain("prescriptionId", "issuedDate", "notes");

            List<String> itemReqFields = getDeclaredFieldNames(PrescriptionItemRequest.class);
            assertThat(itemReqFields).contains("frequency", "prescribedQuantity");
            assertThat(itemReqFields).doesNotContain("dosageFrequency", "prescribedQty", "quantity");

            List<String> rxReqFields = getDeclaredFieldNames(PrescriptionRequest.class);
            assertThat(rxReqFields).contains("doctorInstructions");
            assertThat(rxReqFields).doesNotContain("notes", "instructions");
        }
    }

    @Nested
    @DisplayName("Challenge Category 2: Inbound Legacy Alias Deserialization Compatibility")
    class LegacyAliasInboundDeserializationTests {

        @Test
        @DisplayName("PatientRequest deserializes legacy aliases: nicPassport, phoneNumber, dob")
        void testPatientRequestLegacyAliases() throws Exception {
            String json = """
                {
                    "nicPassport": "NIC-LEGACY-001",
                    "firstName": "Sunil",
                    "lastName": "Silva",
                    "phoneNumber": "0771122334",
                    "dob": "1988-11-23",
                    "gender": "MALE",
                    "bloodGroup": "O_POSITIVE"
                }
                """;

            PatientRequest req = objectMapper.readValue(json, PatientRequest.class);

            assertThat(req.getNicPassportNo()).isEqualTo("NIC-LEGACY-001");
            assertThat(req.getResolvedNic()).isEqualTo("NIC-LEGACY-001");
            assertThat(req.getContactNumber()).isEqualTo("0771122334");
            assertThat(req.getResolvedPhone()).isEqualTo("0771122334");
            assertThat(req.getDateOfBirth()).isEqualTo("1988-11-23");
            assertThat(req.getResolvedDob()).isEqualTo("1988-11-23");
        }

        @Test
        @DisplayName("PatientRequest also accepts alternate alias 'phone'")
        void testPatientRequestPhoneAlias() throws Exception {
            String json = """
                {
                    "phone": "0715566778"
                }
                """;

            PatientRequest req = objectMapper.readValue(json, PatientRequest.class);
            assertThat(req.getContactNumber()).isEqualTo("0715566778");
            assertThat(req.getResolvedPhone()).isEqualTo("0715566778");
        }

        @Test
        @DisplayName("PatientResponse deserializes legacy aliases: patientId, personId, nicPassport, phoneNumber, dob")
        void testPatientResponseLegacyAliases() throws Exception {
            String json = """
                {
                    "patientId": 450,
                    "nicPassport": "NIC-999-XYZ",
                    "phoneNumber": "0720000000",
                    "dob": "1994-02-14"
                }
                """;

            PatientResponse resp = objectMapper.readValue(json, PatientResponse.class);
            assertThat(resp.getId()).isEqualTo(450L);
            assertThat(resp.getPatientId()).isEqualTo(450L);
            assertThat(resp.getPersonId()).isEqualTo(450L);
            assertThat(resp.getNicPassportNo()).isEqualTo("NIC-999-XYZ");
            assertThat(resp.getNicPassport()).isEqualTo("NIC-999-XYZ");
            assertThat(resp.getContactNumber()).isEqualTo("0720000000");
            assertThat(resp.getPhoneNumber()).isEqualTo("0720000000");
            assertThat(resp.getDateOfBirth()).isEqualTo("1994-02-14");
            assertThat(resp.getDob()).isEqualTo("1994-02-14");
        }

        @Test
        @DisplayName("AppointmentRequest deserializes legacy aliases: startTime and symptomsReason")
        void testAppointmentRequestLegacyAliases() throws Exception {
            String json = """
                {
                    "patientId": 10,
                    "doctorId": 20,
                    "appointmentDate": "2026-11-15",
                    "startTime": "14:30",
                    "symptomsReason": "Acute Migraine Headache"
                }
                """;

            AppointmentRequest req = objectMapper.readValue(json, AppointmentRequest.class);
            assertThat(req.getAppointmentTime()).isEqualTo("14:30");
            assertThat(req.getResolvedStartTime()).isEqualTo("14:30");
            assertThat(req.getReasonForVisit()).isEqualTo("Acute Migraine Headache");
            assertThat(req.getResolvedReason()).isEqualTo("Acute Migraine Headache");
        }

        @Test
        @DisplayName("Appointment RescheduleRequest deserializes legacy alias: startTime")
        void testRescheduleRequestLegacyAlias() throws Exception {
            String json = """
                {
                    "appointmentDate": "2026-11-16",
                    "startTime": "09:00"
                }
                """;

            RescheduleRequest req = objectMapper.readValue(json, RescheduleRequest.class);
            assertThat(req.getAppointmentTime()).isEqualTo("09:00");
            assertThat(req.getResolvedStartTime()).isEqualTo("09:00");
        }

        @Test
        @DisplayName("AppointmentResponse deserializes legacy aliases: appointmentId, startTime, symptomsReason")
        void testAppointmentResponseLegacyAliases() throws Exception {
            String json = """
                {
                    "appointmentId": 333,
                    "startTime": "10:15",
                    "symptomsReason": "Followup Consultation"
                }
                """;

            AppointmentResponse resp = objectMapper.readValue(json, AppointmentResponse.class);
            assertThat(resp.getId()).isEqualTo(333L);
            assertThat(resp.getAppointmentId()).isEqualTo(333L);
            assertThat(resp.getAppointmentTime()).isEqualTo("10:15");
            assertThat(resp.getStartTime()).isEqualTo("10:15");
            assertThat(resp.getReasonForVisit()).isEqualTo("Followup Consultation");
            assertThat(resp.getSymptomsReason()).isEqualTo("Followup Consultation");
        }

        @Test
        @DisplayName("DoctorRequest deserializes legacy aliases: contactNumber, phone, licenseNo, licenseNumber")
        void testDoctorRequestLegacyAliases() throws Exception {
            String json1 = """
                {
                    "contactNumber": "0770001111",
                    "licenseNo": "SLMC-8888"
                }
                """;
            DoctorRequest req1 = objectMapper.readValue(json1, DoctorRequest.class);
            assertThat(req1.getPhoneNumber()).isEqualTo("0770001111");
            assertThat(req1.getDoctorLicenseNo()).isEqualTo("SLMC-8888");
            assertThat(req1.getResolvedLicense()).isEqualTo("SLMC-8888");

            String json2 = """
                {
                    "phone": "0770002222",
                    "licenseNumber": "SLMC-7777"
                }
                """;
            DoctorRequest req2 = objectMapper.readValue(json2, DoctorRequest.class);
            assertThat(req2.getPhoneNumber()).isEqualTo("0770002222");
            assertThat(req2.getDoctorLicenseNo()).isEqualTo("SLMC-7777");
        }

        @Test
        @DisplayName("DoctorResponse deserializes legacy aliases: employeeId, phoneNumber, licenseNo, licenseNumber")
        void testDoctorResponseLegacyAliases() throws Exception {
            String json = """
                {
                    "employeeId": 501,
                    "phoneNumber": "0714445555",
                    "licenseNo": "SLMC-LIC-501"
                }
                """;
            DoctorResponse resp = objectMapper.readValue(json, DoctorResponse.class);
            assertThat(resp.getId()).isEqualTo(501L);
            assertThat(resp.getEmployeeId()).isEqualTo(501L);
            assertThat(resp.getContactNumber()).isEqualTo("0714445555");
            assertThat(resp.getPhoneNumber()).isEqualTo("0714445555");
            assertThat(resp.getDoctorLicenseNo()).isEqualTo("SLMC-LIC-501");
            assertThat(resp.getLicenseNo()).isEqualTo("SLMC-LIC-501");
            assertThat(resp.getLicenseNumber()).isEqualTo("SLMC-LIC-501");
        }

        @Test
        @DisplayName("BillingDTOs deserialize legacy aliases: subtotal, invoiceId, status, and PayHere snake_case")
        void testBillingDtosLegacyAliases() throws Exception {
            String itemJson = """
                {
                    "type": "LAB",
                    "subtotal": 1250.50
                }
                """;
            InvoiceItemResponse item = objectMapper.readValue(itemJson, InvoiceItemResponse.class);
            assertThat(item.getTotalPrice()).isEqualByComparingTo(new BigDecimal("1250.50"));
            assertThat(item.getSubtotal()).isEqualByComparingTo(new BigDecimal("1250.50"));

            String invJson = """
                {
                    "invoiceId": 702,
                    "status": "PAID"
                }
                """;
            InvoiceResponse inv = objectMapper.readValue(invJson, InvoiceResponse.class);
            assertThat(inv.getId()).isEqualTo(702L);
            assertThat(inv.getInvoiceId()).isEqualTo(702L);
            assertThat(inv.getPaymentStatus()).isEqualTo("PAID");
            assertThat(inv.getStatus()).isEqualTo("PAID");

            String payHereJson = """
                {
                    "merchant_id": "MERCHANT-01",
                    "order_id": "ORD-999",
                    "notify_url": "https://callback.com",
                    "first_name": "Kasun",
                    "last_name": "Perera",
                    "patientEmail": "kasun@email.lk",
                    "patientPhone": "0771239876"
                }
                """;
            PayHereInitiateResponse ph = objectMapper.readValue(payHereJson, PayHereInitiateResponse.class);
            assertThat(ph.getMerchantId()).isEqualTo("MERCHANT-01");
            assertThat(ph.getOrderId()).isEqualTo("ORD-999");
            assertThat(ph.getNotifyUrl()).isEqualTo("https://callback.com");
            assertThat(ph.getFirstName()).isEqualTo("Kasun");
            assertThat(ph.getLastName()).isEqualTo("Perera");
            assertThat(ph.getEmail()).isEqualTo("kasun@email.lk");
            assertThat(ph.getPhone()).isEqualTo("0771239876");
        }

        @Test
        @DisplayName("LabDTOs deserialize legacy aliases: standardFee, labTestId, technicianNotes, remarks, testId, specimenType")
        void testLabDtosLegacyAliases() throws Exception {
            String catalogJson = """
                {
                    "id": 12,
                    "standardFee": 3500.00
                }
                """;
            LabCatalogResponse cat = objectMapper.readValue(catalogJson, LabCatalogResponse.class);
            assertThat(cat.getPrice()).isEqualByComparingTo(new BigDecimal("3500.00"));
            assertThat(cat.getStandardFee()).isEqualByComparingTo(new BigDecimal("3500.00"));

            String orderJson = """
                {
                    "patientId": 1,
                    "labTestId": 88
                }
                """;
            LabOrderRequest order = objectMapper.readValue(orderJson, LabOrderRequest.class);
            assertThat(order.getTestCatalogId()).isEqualTo(88L);
            assertThat(order.getResolvedTestCatalogId()).isEqualTo(88L);

            String resultJson1 = """
                {
                    "technicianNotes": "Sample haemolysed"
                }
                """;
            LabResultRequest res1 = objectMapper.readValue(resultJson1, LabResultRequest.class);
            assertThat(res1.getClinicalRemarks()).isEqualTo("Sample haemolysed");
            assertThat(res1.getResolvedRemarks()).isEqualTo("Sample haemolysed");

            String resultJson2 = """
                {
                    "remarks": "Retest recommended"
                }
                """;
            LabResultRequest res2 = objectMapper.readValue(resultJson2, LabResultRequest.class);
            assertThat(res2.getClinicalRemarks()).isEqualTo("Retest recommended");

            String respJson = """
                {
                    "testId": 505,
                    "specimenType": "Serum"
                }
                """;
            LabRequestResponse labResp = objectMapper.readValue(respJson, LabRequestResponse.class);
            assertThat(labResp.getId()).isEqualTo(505L);
            assertThat(labResp.getTestId()).isEqualTo(505L);
            assertThat(labResp.getSampleType()).isEqualTo("Serum");
            assertThat(labResp.getSpecimenType()).isEqualTo("Serum");
        }

        @Test
        @DisplayName("PharmacyDTOs deserialize legacy aliases: drugId, dosageFrequency, prescribedQty, quantity, dispensedQty, notes, instructions, issuedDate")
        void testPharmacyDtosLegacyAliases() throws Exception {
            String drugJson = """
                {
                    "drugId": 401
                }
                """;
            DrugResponse drug = objectMapper.readValue(drugJson, DrugResponse.class);
            assertThat(drug.getId()).isEqualTo(401L);
            assertThat(drug.getDrugId()).isEqualTo(401L);

            String itemReqJson = """
                {
                    "drugId": 10,
                    "dosageFrequency": "TDS",
                    "prescribedQty": 21
                }
                """;
            PrescriptionItemRequest itemReq = objectMapper.readValue(itemReqJson, PrescriptionItemRequest.class);
            assertThat(itemReq.getFrequency()).isEqualTo("TDS");
            assertThat(itemReq.getResolvedFrequency()).isEqualTo("TDS");
            assertThat(itemReq.getPrescribedQuantity()).isEqualTo(21);
            assertThat(itemReq.getResolvedPrescribedQuantity()).isEqualTo(21);

            String itemReqJson2 = """
                {
                    "quantity": 14
                }
                """;
            PrescriptionItemRequest itemReq2 = objectMapper.readValue(itemReqJson2, PrescriptionItemRequest.class);
            assertThat(itemReq2.getPrescribedQuantity()).isEqualTo(14);

            String itemRespJson = """
                {
                    "id": 99,
                    "prescribedQty": 30,
                    "dispensedQty": 20
                }
                """;
            PrescriptionItemResponse itemResp = objectMapper.readValue(itemRespJson, PrescriptionItemResponse.class);
            assertThat(itemResp.getDrugId()).isEqualTo(99L);
            assertThat(itemResp.getId()).isEqualTo(99L);
            assertThat(itemResp.getPrescribedQuantity()).isEqualTo(30);
            assertThat(itemResp.getPrescribedQty()).isEqualTo(30);
            assertThat(itemResp.getDispensedQuantity()).isEqualTo(20);
            assertThat(itemResp.getDispensedQty()).isEqualTo(20);

            String rxReqJson1 = """
                {
                    "notes": "Take after meals"
                }
                """;
            PrescriptionRequest rxReq1 = objectMapper.readValue(rxReqJson1, PrescriptionRequest.class);
            assertThat(rxReq1.getDoctorInstructions()).isEqualTo("Take after meals");
            assertThat(rxReq1.getResolvedNotes()).isEqualTo("Take after meals");

            String rxReqJson2 = """
                {
                    "instructions": "Avoid alcohol"
                }
                """;
            PrescriptionRequest rxReq2 = objectMapper.readValue(rxReqJson2, PrescriptionRequest.class);
            assertThat(rxReq2.getDoctorInstructions()).isEqualTo("Avoid alcohol");

            String rxRespJson = """
                {
                    "prescriptionId": 808,
                    "issuedDate": "2026-10-01",
                    "notes": "Bedtime dose only"
                }
                """;
            PrescriptionResponse rxResp = objectMapper.readValue(rxRespJson, PrescriptionResponse.class);
            assertThat(rxResp.getId()).isEqualTo(808L);
            assertThat(rxResp.getPrescriptionId()).isEqualTo(808L);
            assertThat(rxResp.getPrescriptionDate()).isEqualTo("2026-10-01");
            assertThat(rxResp.getIssuedDate()).isEqualTo("2026-10-01");
            assertThat(rxResp.getDoctorInstructions()).isEqualTo("Bedtime dose only");
            assertThat(rxResp.getNotes()).isEqualTo("Bedtime dose only");
        }
    }

    @Nested
    @DisplayName("Challenge Category 3: Outbound Serialization Dual-Contract Wire Verification")
    class OutboundSerializationDualContractTests {

        @Test
        @DisplayName("PatientResponse serialization simultaneously emits canonical and legacy wire keys")
        void testPatientResponseSerializationDualContract() throws Exception {
            PatientResponse resp = PatientResponse.builder()
                    .id(100L)
                    .nicPassportNo("NIC123456789")
                    .firstName("Amal")
                    .lastName("Perera")
                    .fullName("Amal Perera")
                    .contactNumber("0771234567")
                    .dateOfBirth("1992-05-10")
                    .isArchived(false)
                    .build();

            String json = objectMapper.writeValueAsString(resp);
            JsonNode tree = objectMapper.readTree(json);

            // Canonical keys
            assertThat(tree.get("id").asLong()).isEqualTo(100L);
            assertThat(tree.get("nicPassportNo").asText()).isEqualTo("NIC123456789");
            assertThat(tree.get("contactNumber").asText()).isEqualTo("0771234567");
            assertThat(tree.get("dateOfBirth").asText()).isEqualTo("1992-05-10");

            // Legacy keys
            assertThat(tree.get("patientId").asLong()).isEqualTo(100L);
            assertThat(tree.get("personId").asLong()).isEqualTo(100L);
            assertThat(tree.get("nicPassport").asText()).isEqualTo("NIC123456789");
            assertThat(tree.get("phoneNumber").asText()).isEqualTo("0771234567");
            assertThat(tree.get("dob").asText()).isEqualTo("1992-05-10");
            assertThat(tree.get("status").asText()).isEqualTo("ACTIVE");
        }

        @Test
        @DisplayName("PatientResponse status key correctly maps archived state")
        void testPatientResponseStatusMapping() throws Exception {
            PatientResponse respArchived = PatientResponse.builder().isArchived(true).build();
            JsonNode treeArchived = objectMapper.readTree(objectMapper.writeValueAsString(respArchived));
            assertThat(treeArchived.get("status").asText()).isEqualTo("ARCHIVED");

            PatientResponse respActive = PatientResponse.builder().isArchived(false).build();
            JsonNode treeActive = objectMapper.readTree(objectMapper.writeValueAsString(respActive));
            assertThat(treeActive.get("status").asText()).isEqualTo("ACTIVE");

            PatientResponse respNull = PatientResponse.builder().isArchived(null).build();
            JsonNode treeNull = objectMapper.readTree(objectMapper.writeValueAsString(respNull));
            assertThat(treeNull.get("status").asText()).isEqualTo("ACTIVE");
        }

        @Test
        @DisplayName("AppointmentResponse serialization emits both canonical and legacy keys")
        void testAppointmentResponseSerializationDualContract() throws Exception {
            AppointmentResponse resp = AppointmentResponse.builder()
                    .id(202L)
                    .appointmentTime("11:30")
                    .reasonForVisit("Followup consultation")
                    .build();

            String json = objectMapper.writeValueAsString(resp);
            JsonNode tree = objectMapper.readTree(json);

            // Canonical
            assertThat(tree.get("id").asLong()).isEqualTo(202L);
            assertThat(tree.get("appointmentTime").asText()).isEqualTo("11:30");
            assertThat(tree.get("reasonForVisit").asText()).isEqualTo("Followup consultation");

            // Legacy
            assertThat(tree.get("appointmentId").asLong()).isEqualTo(202L);
            assertThat(tree.get("startTime").asText()).isEqualTo("11:30");
            assertThat(tree.get("symptomsReason").asText()).isEqualTo("Followup consultation");
        }

        @Test
        @DisplayName("DoctorResponse serialization emits both canonical and legacy keys")
        void testDoctorResponseSerializationDualContract() throws Exception {
            DoctorResponse resp = DoctorResponse.builder()
                    .id(303L)
                    .contactNumber("0719998888")
                    .doctorLicenseNo("SLMC-2026")
                    .build();

            String json = objectMapper.writeValueAsString(resp);
            JsonNode tree = objectMapper.readTree(json);

            // Canonical
            assertThat(tree.get("id").asLong()).isEqualTo(303L);
            assertThat(tree.get("contactNumber").asText()).isEqualTo("0719998888");
            assertThat(tree.get("doctorLicenseNo").asText()).isEqualTo("SLMC-2026");

            // Legacy
            assertThat(tree.get("employeeId").asLong()).isEqualTo(303L);
            assertThat(tree.get("phoneNumber").asText()).isEqualTo("0719998888");
            assertThat(tree.get("licenseNo").asText()).isEqualTo("SLMC-2026");
            assertThat(tree.get("licenseNumber").asText()).isEqualTo("SLMC-2026");
        }

        @Test
        @DisplayName("Billing InvoiceResponse and InvoiceItemResponse emit dual wire contracts")
        void testBillingResponseSerializationDualContract() throws Exception {
            InvoiceItemResponse item = InvoiceItemResponse.builder()
                    .totalPrice(new BigDecimal("2500.00"))
                    .build();
            JsonNode itemTree = objectMapper.readTree(objectMapper.writeValueAsString(item));
            assertThat(itemTree.get("totalPrice").decimalValue()).isEqualByComparingTo("2500.00");
            assertThat(itemTree.get("subtotal").decimalValue()).isEqualByComparingTo("2500.00");

            InvoiceResponse inv = InvoiceResponse.builder()
                    .id(404L)
                    .paymentStatus("PAID")
                    .build();
            JsonNode invTree = objectMapper.readTree(objectMapper.writeValueAsString(inv));
            assertThat(invTree.get("id").asLong()).isEqualTo(404L);
            assertThat(invTree.get("invoiceId").asLong()).isEqualTo(404L);
            assertThat(invTree.get("paymentStatus").asText()).isEqualTo("PAID");
            assertThat(invTree.get("status").asText()).isEqualTo("PAID");
        }

        @Test
        @DisplayName("PayHereInitiateResponse serialization emits dual camelCase and snake_case contracts")
        void testPayHereInitiateResponseSerializationDualContract() throws Exception {
            PayHereInitiateResponse ph = PayHereInitiateResponse.builder()
                    .merchantId("1221122")
                    .orderId("INV-2026-001")
                    .notifyUrl("https://api.pulseos.lk/payments/notify")
                    .firstName("Nimal")
                    .lastName("Sirisena")
                    .email("nimal@pulseos.lk")
                    .phone("0778899001")
                    .build();

            JsonNode tree = objectMapper.readTree(objectMapper.writeValueAsString(ph));

            assertThat(tree.get("merchantId").asText()).isEqualTo("1221122");
            assertThat(tree.get("merchant_id").asText()).isEqualTo("1221122");
            assertThat(tree.get("orderId").asText()).isEqualTo("INV-2026-001");
            assertThat(tree.get("order_id").asText()).isEqualTo("INV-2026-001");
            assertThat(tree.get("notifyUrl").asText()).isEqualTo("https://api.pulseos.lk/payments/notify");
            assertThat(tree.get("notify_url").asText()).isEqualTo("https://api.pulseos.lk/payments/notify");
            assertThat(tree.get("patientFirstName").asText()).isEqualTo("Nimal");
            assertThat(tree.get("first_name").asText()).isEqualTo("Nimal");
            assertThat(tree.get("patientLastName").asText()).isEqualTo("Sirisena");
            assertThat(tree.get("last_name").asText()).isEqualTo("Sirisena");
            assertThat(tree.get("email").asText()).isEqualTo("nimal@pulseos.lk");
            assertThat(tree.get("patientEmail").asText()).isEqualTo("nimal@pulseos.lk");
            assertThat(tree.get("phone").asText()).isEqualTo("0778899001");
            assertThat(tree.get("patientPhone").asText()).isEqualTo("0778899001");
        }

        @Test
        @DisplayName("Lab Catalog and Request Responses emit dual wire contracts")
        void testLabResponseSerializationDualContract() throws Exception {
            LabCatalogResponse cat = LabCatalogResponse.builder()
                    .price(new BigDecimal("1800.00"))
                    .build();
            JsonNode catTree = objectMapper.readTree(objectMapper.writeValueAsString(cat));
            assertThat(catTree.get("price").decimalValue()).isEqualByComparingTo("1800.00");
            assertThat(catTree.get("standardFee").decimalValue()).isEqualByComparingTo("1800.00");

            LabRequestResponse reqResp = LabRequestResponse.builder()
                    .id(606L)
                    .sampleType("Capillary Blood")
                    .build();
            JsonNode reqTree = objectMapper.readTree(objectMapper.writeValueAsString(reqResp));
            assertThat(reqTree.get("id").asLong()).isEqualTo(606L);
            assertThat(reqTree.get("testId").asLong()).isEqualTo(606L);
            assertThat(reqTree.get("sampleType").asText()).isEqualTo("Capillary Blood");
            assertThat(reqTree.get("specimenType").asText()).isEqualTo("Capillary Blood");
        }

        @Test
        @DisplayName("Pharmacy Drug, Prescription Item, and Prescription Responses emit dual wire contracts")
        void testPharmacyResponseSerializationDualContract() throws Exception {
            DrugResponse drug = DrugResponse.builder().id(707L).build();
            JsonNode drugTree = objectMapper.readTree(objectMapper.writeValueAsString(drug));
            assertThat(drugTree.get("id").asLong()).isEqualTo(707L);
            assertThat(drugTree.get("drugId").asLong()).isEqualTo(707L);

            PrescriptionItemResponse item = PrescriptionItemResponse.builder()
                    .drugId(808L)
                    .prescribedQuantity(15)
                    .dispensedQuantity(10)
                    .build();
            JsonNode itemTree = objectMapper.readTree(objectMapper.writeValueAsString(item));
            assertThat(itemTree.get("drugId").asLong()).isEqualTo(808L);
            assertThat(itemTree.get("id").asLong()).isEqualTo(808L);
            assertThat(itemTree.get("prescribedQuantity").asInt()).isEqualTo(15);
            assertThat(itemTree.get("prescribedQty").asInt()).isEqualTo(15);
            assertThat(itemTree.get("dispensedQuantity").asInt()).isEqualTo(10);
            assertThat(itemTree.get("dispensedQty").asInt()).isEqualTo(10);

            PrescriptionResponse rx = PrescriptionResponse.builder()
                    .id(909L)
                    .prescriptionDate("2026-10-04")
                    .doctorInstructions("Take once daily morning")
                    .build();
            JsonNode rxTree = objectMapper.readTree(objectMapper.writeValueAsString(rx));
            assertThat(rxTree.get("id").asLong()).isEqualTo(909L);
            assertThat(rxTree.get("prescriptionId").asLong()).isEqualTo(909L);
            assertThat(rxTree.get("prescriptionDate").asText()).isEqualTo("2026-10-04");
            assertThat(rxTree.get("issuedDate").asText()).isEqualTo("2026-10-04");
            assertThat(rxTree.get("doctorInstructions").asText()).isEqualTo("Take once daily morning");
            assertThat(rxTree.get("notes").asText()).isEqualTo("Take once daily morning");
        }
    }

    @Nested
    @DisplayName("Challenge Category 4: Edge Case Serialization & Boundary Robustness")
    class EdgeCaseSerializationTests {

        @Test
        @DisplayName("Null fields handling with NON_NULL inclusion: null fields omitted, non-null preserved")
        void testNullFieldsOmittedWithNonNullInclusion() throws Exception {
            PatientResponse resp = PatientResponse.builder()
                    .id(1L)
                    .nicPassportNo("NIC-1")
                    .allergies(null)
                    .medicalNotes(null)
                    .emergencyContactName(null)
                    .build();

            String json = objectMapper.writeValueAsString(resp);
            JsonNode tree = objectMapper.readTree(json);

            assertThat(tree.has("id")).isTrue();
            assertThat(tree.has("nicPassportNo")).isTrue();
            assertThat(tree.has("allergies")).isFalse();
            assertThat(tree.has("medicalNotes")).isFalse();
            assertThat(tree.has("emergencyContactName")).isFalse();
        }

        @Test
        @DisplayName("Empty strings handling: empty strings are preserved without mutation or crash")
        void testEmptyStringsHandling() throws Exception {
            String emptyRequestJson = """
                {
                    "nicPassport": "",
                    "firstName": "",
                    "lastName": "",
                    "phoneNumber": "",
                    "dob": ""
                }
                """;

            PatientRequest req = objectMapper.readValue(emptyRequestJson, PatientRequest.class);
            assertThat(req.getNicPassportNo()).isEqualTo("");
            assertThat(req.getResolvedNic()).isEqualTo("");
            assertThat(req.getContactNumber()).isEqualTo("");
            assertThat(req.getResolvedPhone()).isEqualTo("");
            assertThat(req.getDateOfBirth()).isEqualTo("");
            assertThat(req.getResolvedDob()).isEqualTo("");

            PatientResponse resp = PatientResponse.builder()
                    .nicPassportNo("")
                    .contactNumber("")
                    .dateOfBirth("")
                    .build();

            String serialized = objectMapper.writeValueAsString(resp);
            JsonNode tree = objectMapper.readTree(serialized);
            assertThat(tree.get("nicPassportNo").asText()).isEqualTo("");
            assertThat(tree.get("contactNumber").asText()).isEqualTo("");
            assertThat(tree.get("dateOfBirth").asText()).isEqualTo("");
        }

        @Test
        @DisplayName("Unicode and multilingual characters: Sinhala, Tamil, Japanese, Emojis survive round-trip")
        void testUnicodeAndMultilingualPreservation() throws Exception {
            String sinhalaName = "සුනිල් රත්නායක";
            String tamilAddress = "இலங்கை, கொழும்பு 07";
            String emojiNotes = "🏥 Patient admitted with severe pain 💉 💊 Emergency 🚨";

            PatientRequest req = PatientRequest.builder()
                    .nicPassportNo("NIC-UNI-001")
                    .firstName(sinhalaName)
                    .address(tamilAddress)
                    .medicalNotes(emojiNotes)
                    .build();

            String json = objectMapper.writeValueAsString(req);
            PatientRequest deserialized = objectMapper.readValue(json, PatientRequest.class);

            assertThat(deserialized.getFirstName()).isEqualTo(sinhalaName);
            assertThat(deserialized.getAddress()).isEqualTo(tamilAddress);
            assertThat(deserialized.getMedicalNotes()).isEqualTo(emojiNotes);
        }

        @Test
        @DisplayName("Special characters, escape sequences, quotes, and HTML/SQL injection strings")
        void testSpecialCharactersAndInjectionStrings() throws Exception {
            String specialReason = "Patient stated: \"I feel 'dizzy' \\ nausea\" & has <script>alert('xss')</script> / symptoms --'; DROP TABLE appointments; #";
            String escapedNotes = "Line 1\nLine 2\tTabbed\r\nCRLF and backslash \\\\ end.";

            AppointmentRequest req = AppointmentRequest.builder()
                    .reasonForVisit(specialReason)
                    .roomNumber(escapedNotes)
                    .build();

            String json = objectMapper.writeValueAsString(req);
            AppointmentRequest deserialized = objectMapper.readValue(json, AppointmentRequest.class);

            assertThat(deserialized.getReasonForVisit()).isEqualTo(specialReason);
            assertThat(deserialized.getResolvedReason()).isEqualTo(specialReason);
            assertThat(deserialized.getRoomNumber()).isEqualTo(escapedNotes);
        }

        @Test
        @DisplayName("Conflicting alias and canonical properties: Jackson processes tokens in order without error")
        void testConflictingAliasAndCanonicalPrecedence() throws Exception {
            // dateOfBirth specified before dob
            String json1 = """
                {
                    "dateOfBirth": "1990-01-01",
                    "dob": "1995-05-05"
                }
                """;
            PatientRequest req1 = objectMapper.readValue(json1, PatientRequest.class);
            // In token streaming, last token updates property
            assertThat(req1.getDateOfBirth()).isEqualTo("1995-05-05");

            // dob specified before dateOfBirth
            String json2 = """
                {
                    "dob": "1995-05-05",
                    "dateOfBirth": "1990-01-01"
                }
                """;
            PatientRequest req2 = objectMapper.readValue(json2, PatientRequest.class);
            assertThat(req2.getDateOfBirth()).isEqualTo("1990-01-01");
        }

        @Test
        @DisplayName("Unknown properties handling: extraneous payload keys do not fail deserialization")
        void testUnknownPropertiesIgnoredGracefully() throws Exception {
            String json = """
                {
                    "nicPassportNo": "NIC-EXTRA-01",
                    "unknownField1": "some-junk",
                    "maliciousPayload": 12345
                }
                """;
            PatientRequest req = objectMapper.readValue(json, PatientRequest.class);
            assertThat(req.getNicPassportNo()).isEqualTo("NIC-EXTRA-01");
        }

        @Test
        @DisplayName("Numerical boundary conditions: Long.MAX_VALUE, BigDecimal high precision, Zero")
        void testNumericalBoundaryConditions() throws Exception {
            Long maxId = Long.MAX_VALUE;
            BigDecimal preciseFee = new BigDecimal("99999999.9999");

            InvoiceResponse inv = InvoiceResponse.builder()
                    .id(maxId)
                    .totalAmount(preciseFee)
                    .discountAmount(BigDecimal.ZERO)
                    .build();

            String json = objectMapper.writeValueAsString(inv);
            JsonNode tree = objectMapper.readTree(json);

            assertThat(tree.get("id").asLong()).isEqualTo(maxId);
            assertThat(tree.get("invoiceId").asLong()).isEqualTo(maxId);
            assertThat(tree.get("totalAmount").decimalValue()).isEqualByComparingTo(preciseFee);
            assertThat(tree.get("discountAmount").decimalValue()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Autowired
    private com.pulseos.patient.PatientRepository patientRepository;

    @Autowired
    private com.pulseos.doctor.DoctorRepository doctorRepository;

    @Nested
    @DisplayName("Challenge Category 5: End-to-End Spring MockMvc HTTP Contract Compatibility")
    class SpringMockMvcHttpContractCompatibilityTests {

        @Test
        @DisplayName("POST /api/v1/patients accepts legacy alias payload and returns dual-contract response")
        void testCreatePatientWithLegacyPayloadViaHttp() throws Exception {
            String uniqueNic = "NIC" + (System.currentTimeMillis() % 1000000000L);
            String legacyPayload = String.format("""
                {
                    "nicPassport": "%s",
                    "firstName": "Nuwan",
                    "lastName": "Kulasekara",
                    "email": "nuwan.%d@example.com",
                    "phoneNumber": "0778899112",
                    "dob": "1982-07-22",
                    "gender": "MALE",
                    "bloodGroup": "A_POSITIVE",
                    "triagePriority": "ROUTINE"
                }
                """, uniqueNic, System.currentTimeMillis());

            mockMvc.perform(post("/api/v1/patients")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(legacyPayload))
                    .andExpect(status().isCreated())
                    // Verify canonical keys in response
                    .andExpect(jsonPath("$.nicPassportNo").value(uniqueNic))
                    .andExpect(jsonPath("$.contactNumber").value("0778899112"))
                    .andExpect(jsonPath("$.dateOfBirth").value("1982-07-22"))
                    .andExpect(jsonPath("$.firstName").value("Nuwan"))
                    // Verify legacy keys in response
                    .andExpect(jsonPath("$.nicPassport").value(uniqueNic))
                    .andExpect(jsonPath("$.phoneNumber").value("0778899112"))
                    .andExpect(jsonPath("$.dob").value("1982-07-22"))
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.patientId").exists())
                    .andExpect(jsonPath("$.personId").exists());
        }

        @Test
        @DisplayName("POST /api/v1/appointments accepts legacy 'startTime' and 'symptomsReason' and returns dual-contract response")
        void testCreateAppointmentWithLegacyPayloadViaHttp() throws Exception {
            com.pulseos.patient.Patient validPatient = patientRepository.findAll().stream().findFirst().orElseThrow();
            com.pulseos.doctor.Doctor validDoctor = doctorRepository.findAll().stream().findFirst().orElseThrow();

            String legacyAptPayload = String.format("""
                {
                    "patientId": %d,
                    "doctorId": %d,
                    "appointmentDate": "2026-12-28",
                    "startTime": "16:00",
                    "symptomsReason": "Routine annual medical assessment"
                }
                """, validPatient.getId(), validDoctor.getId());

            mockMvc.perform(post("/api/v1/appointments")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(legacyAptPayload))
                    .andExpect(status().isCreated())
                    // Canonical
                    .andExpect(jsonPath("$.appointmentTime").value("16:00"))
                    .andExpect(jsonPath("$.reasonForVisit").value("Routine annual medical assessment"))
                    // Legacy
                    .andExpect(jsonPath("$.startTime").value("16:00"))
                    .andExpect(jsonPath("$.symptomsReason").value("Routine annual medical assessment"))
                    .andExpect(jsonPath("$.appointmentId").exists());
        }

        @Test
        @DisplayName("GET /api/v1/patients/{id} returns both canonical and legacy contract keys")
        void testGetPatientDualContractViaHttp() throws Exception {
            com.pulseos.patient.Patient validPatient = patientRepository.findAll().stream().findFirst().orElseThrow();

            mockMvc.perform(get("/api/v1/patients/" + validPatient.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(validPatient.getId()))
                    .andExpect(jsonPath("$.patientId").value(validPatient.getId()))
                    .andExpect(jsonPath("$.personId").value(validPatient.getId()))
                    .andExpect(jsonPath("$.nicPassportNo").value(validPatient.getNicPassportNo()))
                    .andExpect(jsonPath("$.nicPassport").value(validPatient.getNicPassportNo()))
                    .andExpect(jsonPath("$.contactNumber").exists())
                    .andExpect(jsonPath("$.phoneNumber").exists())
                    .andExpect(jsonPath("$.dateOfBirth").exists())
                    .andExpect(jsonPath("$.dob").exists())
                    .andExpect(jsonPath("$.status").value("ACTIVE"));
        }
    }
}
