package com.feirs.backend.config;

import com.feirs.backend.models.Institution;
import com.feirs.backend.models.Operator;
import com.feirs.backend.repositories.InstitutionRepository;
import com.feirs.backend.repositories.OperatorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

// @Configuration
public class OperatorMockDataRunner implements CommandLineRunner {

    private final OperatorRepository operatorRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    public OperatorMockDataRunner(OperatorRepository operatorRepository,
                                  InstitutionRepository institutionRepository,
                                  PasswordEncoder passwordEncoder) {
        this.operatorRepository = operatorRepository;
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (operatorRepository.existsById("FEIRS-OP-0001")) {
            System.out.println("Mock operators already exist. Skipping OperatorMockDataRunner.");
            return;
        }

        System.out.println("Executing OperatorMockDataRunner to inject mock operators...");

        // Ensure institutions exist
        Institution inst10 = institutionRepository.findById("FEIRS-INST-0010").orElseGet(() -> {
            Institution i = Institution.builder()
                .institutionId("FEIRS-INST-0010")
                .institutionName("Apollo Speciality Hospital")
                .officialEmail("contact@apollo.bengaluru.com")
                .passwordHash(passwordEncoder.encode("Apollo@123"))
                .accountStatus("ACTIVE")
                .verificationDocumentUrl("https://dummy.url")
                .phoneCountryCode("+91")
                .phoneNumber("9000000001")
                .addressLine1("Apollo Address")
                .city("Bengaluru")
                .state("Karnataka")
                .country("India")
                .pinCode("560001")
                .primaryOfficerName("Apollo Officer")
                .sectorType("PRIVATE")
                .institutionType("HOSPITAL")
                .officerDesignation("Chief Administrator")
                .build();
            // Using reflection or setting manually if no setters for fields like createdAt
            return institutionRepository.save(i);
        });

        Institution inst11 = institutionRepository.findById("FEIRS-INST-0011").orElseGet(() -> {
            Institution i = Institution.builder()
                .institutionId("FEIRS-INST-0011")
                .institutionName("City Government Hospital")
                .officialEmail("contact@citygovt.chennai.gov.in")
                .passwordHash(passwordEncoder.encode("CityGovt@123"))
                .accountStatus("ACTIVE")
                .verificationDocumentUrl("https://dummy.url")
                .phoneCountryCode("+91")
                .phoneNumber("9000000002")
                .addressLine1("City Govt Address")
                .city("Chennai")
                .state("Tamil Nadu")
                .country("India")
                .pinCode("600001")
                .primaryOfficerName("City Govt Officer")
                .sectorType("PUBLIC")
                .institutionType("HOSPITAL")
                .officerDesignation("Medical Superintendent")
                .build();
            return institutionRepository.save(i);
        });

        // Insert Operators
        LocalDateTime baseTime = LocalDateTime.of(2026, 7, 7, 13, 0, 0); // July 7, 2026 at 1:00 PM

        insertOperator("FEIRS-OP-0001", inst10, "Shubham Patil", "shubham.patil@gmail.com", "Shubham@123", "Male", "Emergency Room", "Duty Doctor", LocalDate.of(1985, 3, 12), "+91", "9876543210", "Apollo Quarters", "Bannerghatta Road", "Bengaluru", "Karnataka", "India", "560076", "ACTIVE", baseTime.plusMinutes(5));
        insertOperator("FEIRS-OP-0002", inst10, "Nandini Iyer", "nandini.iyer@gmail.com", "Nandini@123", "Female", "Intensive Care Unit", "Senior Nurse", LocalDate.of(1992, 8, 24), "+91", "8765432109", "Jayanagar 4th Block", "", "Bengaluru", "Karnataka", "India", "560011", "ACTIVE", baseTime.plusMinutes(15));
        insertOperator("FEIRS-OP-0003", inst10, "Ravi Gowda", "ravi.gowda@gmail.com", "Ravi@123", "Male", "Trauma Care", "ER Technician", LocalDate.of(1988, 11, 2), "+91", "7654321098", "BTM Layout", "Stage 2", "Bengaluru", "Karnataka", "India", "560076", "ACTIVE", baseTime.plusMinutes(35));
        insertOperator("FEIRS-OP-0004", inst10, "Amit Verma", "amit.verma@gmail.com", "Amit@123", "Male", "Emergency Room", "Paramedic", LocalDate.of(1995, 1, 15), "+91", "6543210987", "Koramangala 1st Block", "", "Bengaluru", "Karnataka", "India", "560034", "SUSPENDED", baseTime.plusMinutes(45));
        insertOperator("FEIRS-OP-0005", inst10, "Sneha Kumari", "sneha.kumari@gmail.com", "Sneha@123", "Female", "Neurology", "Staff Nurse", LocalDate.of(1990, 6, 30), "+91", "9988776655", "HSR Layout", "Sector 3", "Bengaluru", "Karnataka", "India", "560102", "ACTIVE", baseTime.plusMinutes(55));

        insertOperator("FEIRS-OP-0006", inst11, "Arjun Reddy", "arjun.reddy@gmail.com", "Arjun@123", "Male", "General Ward", "Duty Doctor", LocalDate.of(1984, 5, 21), "+91", "9876501234", "Anna Nagar", "1st Avenue", "Chennai", "Tamil Nadu", "India", "600040", "ACTIVE", baseTime.plusMinutes(65));
        insertOperator("FEIRS-OP-0007", inst11, "Deepak Gupta", "deepak.gupta@gmail.com", "Deepak@123", "Male", "Emergency Room", "Senior Paramedic", LocalDate.of(1989, 9, 10), "+91", "8765412345", "T Nagar", "GN Chetty Road", "Chennai", "Tamil Nadu", "India", "600017", "ACTIVE", baseTime.plusMinutes(80));
        insertOperator("FEIRS-OP-0008", inst11, "Anjali Nair", "anjali.nair@gmail.com", "Anjali@123", "Female", "Trauma Care", "Emergency Nurse", LocalDate.of(1993, 2, 14), "+91", "7654323456", "Adyar", "LB Road", "Chennai", "Tamil Nadu", "India", "600020", "SUSPENDED", baseTime.plusMinutes(95));
        insertOperator("FEIRS-OP-0009", inst11, "Sanjay Kumar", "sanjay.kumar@gmail.com", "Sanjay@123", "Male", "Cardiology", "Consultant", LocalDate.of(1982, 12, 5), "+91", "6543234567", "Velachery", "100 Feet Road", "Chennai", "Tamil Nadu", "India", "600042", "ACTIVE", baseTime.plusMinutes(115));
        
        System.out.println("Operator Mock Data Insertion Complete!");
    }

    private void insertOperator(String id, Institution institution, String name, String email, String pwd, String gender, String dept, String designation, LocalDate dob, String cc, String phone, String addr1, String addr2, String city, String state, String country, String pin, String status, LocalDateTime createdAt) {
        Operator op = Operator.builder()
            .operatorId(id)
            .institution(institution)
            .fullName(name)
            .officialEmail(email)
            .passwordHash(passwordEncoder.encode(pwd))
            .gender(gender)
            .department(dept)
            .designationTitle(designation)
            .dateOfBirth(dob)
            .phoneCountryCode(cc)
            .phoneNumber(phone)
            .addressLine1(addr1)
            .addressLine2(addr2)
            .city(city)
            .state(state)
            .country(country)
            .pinCode(pin)
            .accountStatus(status)
            .createdAt(createdAt)
            .updatedAt(createdAt)
            .build();
        operatorRepository.save(op);
    }
}
