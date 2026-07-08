package com.feirs.backend.security.services;

import com.feirs.backend.models.Institution;
import com.feirs.backend.models.Operator;
import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.repositories.InstitutionRepository;
import com.feirs.backend.repositories.OperatorRepository;
import com.feirs.backend.repositories.SuperAdminRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final SuperAdminRepository superAdminRepository;
    private final InstitutionRepository institutionRepository;
    private final OperatorRepository operatorRepository;

    public UserDetailsServiceImpl(SuperAdminRepository superAdminRepository,
                                  InstitutionRepository institutionRepository,
                                  OperatorRepository operatorRepository) {
        this.superAdminRepository = superAdminRepository;
        this.institutionRepository = institutionRepository;
        this.operatorRepository = operatorRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Try SuperAdmin (by ID or Email)
        Optional<SuperAdmin> superAdmin = superAdminRepository.findByIdentifierIgnoreCase(identifier);
        if (superAdmin.isPresent()) return UserDetailsImpl.build(superAdmin.get());

        // Try Institution (by ID or Email)
        Optional<Institution> institution = institutionRepository.findByIdentifierIgnoreCase(identifier);
        if (institution.isPresent()) {
            if ("DELETED".equals(institution.get().getAccountStatus())) {
                throw new UsernameNotFoundException("Account is " + institution.get().getAccountStatus());
            }
            return UserDetailsImpl.build(institution.get());
        }

        // Try Operator (by ID or Email)
        Optional<Operator> operator = operatorRepository.findByIdentifierIgnoreCase(identifier);
        if (operator.isPresent()) {
            if ("DELETED".equals(operator.get().getAccountStatus())) {
                throw new UsernameNotFoundException("Account is " + operator.get().getAccountStatus());
            }
            return UserDetailsImpl.build(operator.get());
        }

        throw new UsernameNotFoundException("User Not Found with identifier: " + identifier);
    }
}
