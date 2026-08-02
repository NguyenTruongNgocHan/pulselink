package com.pulselink.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.pulselink.admin.repository.AdminRepository;
import com.pulselink.admin.repository.AdminRepository.StaffUser;
import com.pulselink.admin.service.StaffAuthorizationService;
import com.pulselink.shared.exception.ApiException;

class StaffAuthorizationServiceTest {

    private final AdminRepository repository = mock(AdminRepository.class);
    private final StaffAuthorizationService service = new StaffAuthorizationService(repository);

    @Test
    void roleRankingIsStable() {
        assertThat(StaffAuthorizationService.rank("USER")).isLessThan(
                StaffAuthorizationService.rank("MODERATOR")
        );
        assertThat(StaffAuthorizationService.rank("MODERATOR")).isLessThan(
                StaffAuthorizationService.rank("ADMIN")
        );
        assertThat(StaffAuthorizationService.rank("ADMIN")).isLessThan(
                StaffAuthorizationService.rank("SUPER_ADMIN")
        );
    }

    @Test
    void moderatorCannotManageAnotherModerator() {
        UUID actorId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        when(repository.staffUser(actorId)).thenReturn(Optional.of(
                new StaffUser(actorId, "MODERATOR", "ACTIVE")
        ));
        when(repository.staffUser(targetId)).thenReturn(Optional.of(
                new StaffUser(targetId, "MODERATOR", "ACTIVE")
        ));

        assertThatThrownBy(() -> service.requireCanManageUser(actorId, targetId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("below their own role");
    }

    @Test
    void superAdminCanManageAdmin() {
        UUID actorId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        StaffUser target = new StaffUser(targetId, "ADMIN", "ACTIVE");
        when(repository.staffUser(actorId)).thenReturn(Optional.of(
                new StaffUser(actorId, "SUPER_ADMIN", "ACTIVE")
        ));
        when(repository.staffUser(targetId)).thenReturn(Optional.of(target));

        assertThat(service.requireCanManageUser(actorId, targetId)).isEqualTo(target);
    }
}
