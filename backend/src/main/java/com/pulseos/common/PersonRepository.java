package com.pulseos.common;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    Optional<Person> findByNicPassportNo(String nicPassportNo);
    boolean existsByNicPassportNo(String nicPassportNo);
}
