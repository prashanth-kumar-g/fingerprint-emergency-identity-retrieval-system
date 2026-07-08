package com.feirs.backend.security.services;

import com.feirs.backend.models.Institution;
import com.feirs.backend.models.Operator;
import com.feirs.backend.models.SuperAdmin;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private String id;
    private String username;
    private String email;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private String accountStatus;

    public UserDetailsImpl(String id, String username, String email, String password,
                           Collection<? extends GrantedAuthority> authorities, String accountStatus) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.accountStatus = accountStatus;
    }

    public static UserDetailsImpl build(SuperAdmin superAdmin) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
        return new UserDetailsImpl(
                superAdmin.getSuperAdminId(),
                superAdmin.getSuperAdminId(), // Use ID as username for Spring Security
                superAdmin.getMasterEmail(),
                superAdmin.getPasswordHash(),
                authorities,
                "ACTIVE"); // SuperAdmin does not have suspension status
    }

    public static UserDetailsImpl build(Institution institution) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_INSTITUTION"));
        return new UserDetailsImpl(
                institution.getInstitutionId(),
                institution.getInstitutionId(),
                institution.getOfficialEmail(),
                institution.getPasswordHash(),
                authorities,
                institution.getAccountStatus());
    }

    public static UserDetailsImpl build(Operator operator) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_OPERATOR"));
        return new UserDetailsImpl(
                operator.getOperatorId(),
                operator.getOperatorId(),
                operator.getOfficialEmail(),
                operator.getPasswordHash(),
                authorities,
                operator.getAccountStatus());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
