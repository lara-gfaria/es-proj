import Volunteer from '@/models/volunteer/Volunteer';
import Participation from '@/models/participation/Participation';

export default class VolunteerProfile {
    id: number | null = null;
    shortBio!: string;
    numTotalEnrollments!: number;
    numTotalParticipations!: number;
    numTotalAssessments!: number;
    averageRating!: number;
    volunteer!: Volunteer;
    selectedParticipations: Participation[] = [];
    
    constructor(jsonObj?: VolunteerProfile) {
        if (jsonObj) {
            this.id = jsonObj.id;
            this.shortBio = jsonObj.shortBio;
            this.numTotalEnrollments = jsonObj.numTotalEnrollments;
            this.numTotalAssessments = jsonObj.numTotalAssessments;
            this.numTotalParticipations = jsonObj.numTotalParticipations;
            this.averageRating = jsonObj.averageRating;
            this.volunteer = jsonObj.volunteer;
            this.selectedParticipations = jsonObj.selectedParticipations.map((participations: Participation) => {
                return new Participation(participations);
            });
        }
    }
}