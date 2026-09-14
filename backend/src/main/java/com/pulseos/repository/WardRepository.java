package com.pulseos.repository;

import com.pulseos.entity.Ward;
import com.pulseos.entity.enums.WardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {
    Optional<Ward> findByWardName(String wardName);
    List<Ward> findByWardType(WardType wardType);
}
