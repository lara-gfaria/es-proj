package pt.ulisboa.tecnico.socialsoftware.humanaethica.activitysuggestion;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.activity.dto.ActivityDto;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.activitysuggestion.domain.ActivitySuggestion;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.activitysuggestion.dto.ActivitySuggestionDto;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.activitysuggestion.repository.ActivitySuggestionRepository;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.domain.Enrollment;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.dto.EnrollmentDto;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.exceptions.HEException;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.institution.domain.Institution;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.institution.repository.InstitutionRepository;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.user.domain.Volunteer;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.user.repository.UserRepository;

import java.util.Comparator;
import java.util.List;

import static pt.ulisboa.tecnico.socialsoftware.humanaethica.exceptions.ErrorMessage.*;

@Service
public class ActivitySuggestionService {
    @Autowired
    UserRepository userRepository;
    @Autowired
    InstitutionRepository institutionRepository;
    @Autowired
    ActivitySuggestionRepository activitySuggestionRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<ActivitySuggestionDto> getActivitySuggestionsByInstitution(Integer institutionId) {
        if (institutionId == null) throw new HEException(INSTITUTION_NOT_FOUND);
        institutionRepository.findById(institutionId).orElseThrow(() -> new HEException(INSTITUTION_NOT_FOUND));

        return this.activitySuggestionRepository.getActivitySuggestionsByInstitutionId(institutionId).stream()
                .map(ActivitySuggestionDto::new)
                .toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ActivitySuggestionDto createActivitySuggestion(Integer userId, Integer institutionId, ActivitySuggestionDto activitySuggestionDto) {
        if (userId == null) throw new HEException(USER_NOT_FOUND);
        Volunteer volunteer = (Volunteer) userRepository.findById(userId).orElseThrow(() -> new HEException(USER_NOT_FOUND));

        if (institutionId == null) throw new HEException(INSTITUTION_NOT_FOUND);
        Institution institution =  institutionRepository.findById(institutionId).orElseThrow(() -> new HEException(INSTITUTION_NOT_FOUND));

        if (activitySuggestionDto == null) throw new HEException(ACTIVITY_SUGGESTION_DESCRIPTION_INVALID);

        ActivitySuggestion activitySuggestion = new ActivitySuggestion(institution, volunteer, activitySuggestionDto);
        activitySuggestionRepository.save(activitySuggestion);

        return new ActivitySuggestionDto(activitySuggestion);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<ActivitySuggestionDto> getVolunteerActivitySuggestions(Integer userId) {
        if (userId == null) throw new HEException(USER_NOT_FOUND);

        return activitySuggestionRepository.getActivitySuggestionsByVolunteerId(userId).stream()
                .sorted(Comparator.comparing(ActivitySuggestion::getName, String.CASE_INSENSITIVE_ORDER))
                .map(ActivitySuggestionDto::new)
                .toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ActivitySuggestionDto approveActivitySuggestionReview(Integer activitySuggestionId) {

        ActivitySuggestion activitySuggestion = activitySuggestionRepository.findById(activitySuggestionId).orElseThrow(() -> new HEException(ACTIVITY_SUGGESTION_NOT_FOUND, activitySuggestionId));
        activitySuggestion.setState(ActivitySuggestion.State.APPROVED);

        return new ActivitySuggestionDto(activitySuggestion);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ActivitySuggestionDto rejectActivitySuggestionReview(Integer activitySuggestionId) {

        ActivitySuggestion activitySuggestion = activitySuggestionRepository.findById(activitySuggestionId).orElseThrow(() -> new HEException(ACTIVITY_SUGGESTION_NOT_FOUND, activitySuggestionId));
        activitySuggestion.setState(ActivitySuggestion.State.REJECTED);

        return new ActivitySuggestionDto(activitySuggestion);
    }
}