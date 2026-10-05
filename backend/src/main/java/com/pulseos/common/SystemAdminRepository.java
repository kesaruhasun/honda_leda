package com.pulseos.common;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemAdminRepository extends JpaRepository<SystemAdmin, Long> {
    List<SystemAdmin> findByAdminLevel(String adminLevel);
}
