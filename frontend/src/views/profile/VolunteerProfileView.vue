<template>
  <div class="container">
    <div v-if="!profile?.id">
      <h1>Volunteer Profile</h1>
      <p>No volunteer profile found. Click the button below to create a new one!</p>
      <v-btn
        color="primary"
        @click="newProfile"
        data-cy="createProfile"
        >Create my profile</v-btn
      >
    </div>
    <div v-else>
      <h1 data-cy="volunteerName">Volunteer: {{ profile.volunteer.name }}</h1>
      <div class="text-description">
        <p data-cy="shortBio"><strong>Short Bio: </strong> {{ profile.shortBio }}</p>
      </div>
      <v-container>
        <v-row justify="center">
          <div class="stats-container">
            <div class="items">
              <div class="icon-wrapper">
              <span>{{ profile.numTotalEnrollments }}</span>
            </div>
            <div class="project-name">
              <p>Total Enrollments</p>
            </div>
          </div>
        </div>
        <div class="stats-container">
          <div class="items">
            <div class="icon-wrapper">
              <span data-cy="numTotalParticipations">{{ profile.numTotalParticipations }}</span>
            </div>
            <div class="project-name">
              <p>Total Participations</p>
            </div>
          </div>
        </div> 
        <div class="stats-container">
          <div class="items">
            <div class="icon-wrapper">
              <span>{{ profile.numTotalAssessments }}</span>
            </div>
            <div class="project-name">
              <p>Total Assessments</p>
            </div>
          </div>
        </div> 
      </v-row>
      <v-row justify="center">
        <div class="stats-container">
          <div class="items">
            <div class="icon-wrapper">
              <span>{{ profile.averageRating.toFixed(2) }}</span>
            </div>
            <div class="project-name">
              <p>Average Rating</p>
            </div>
          </div>
        </div> 
      </v-row>
    </v-container>
      
      <div>
        <h2>Selected Participations</h2>
        <div>
          <v-card class="table">
            <v-data-table
              :headers="headers"
              :search="search"
              :items="profile.selectedParticipations"
              disable-pagination
              :hide-default-footer="true"
              :mobile-breakpoint="0"
              data-cy="selectedParticipationsTable"
            >
              <template v-slot:item.activityName="{ item }">
                {{ activityName(item) }}
              </template>
              <template v-slot:item.institutionName="{ item }">
                {{ institutionName(item) }}
              </template>
              <template v-slot:item.memberRating="{ item }">
                {{ getMemberRating(item) }}
              </template>
              <template v-slot:top>
                <v-card-title>
                  <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Search"
                    class="mx-2"
                  />
                  <v-spacer />
                </v-card-title>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </div>
    </div>
    <volunteer-profile-dialog
      v-if="createProfile"
      v-model="createProfile"
      :activities="activities"
      v-on:create-volunteer-profile="onCreateVolunteerProfile"
      v-on:close-volunteer-profile-dialog="onCloseVolunteerProfileDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from "@/services/RemoteServices";
import Participation from "@/models/participation/Participation";
import Activity from "@/models/activity/Activity";
import VolunteerProfile from '@/models/profiles/VolunteerProfile';
import VolunteerProfileDialog from './VolunteerProfileDialog.vue';

@Component({
  components: {
    'volunteer-profile-dialog' : VolunteerProfileDialog,
  }
})
export default class VolunteerProfileView extends Vue {
  userId: number = 0;
  profile: VolunteerProfile | null = null;
  createProfile: boolean = false;

  activities: Activity[] = [];
  
  search: string = '';

  headers: object = [
    {
      text: 'Activity Name',
      value: 'activityName',
      align: 'left',
      width: '20%',
    },
    {
      text: 'Institution',
      value: 'institutionName',
      align: 'left',
      width: '20%',
    },
    {
      text: 'Rating',
      value: 'memberRating',
      align: 'left',
      width: '20%',
    },
    {
      text: 'Review',
      value: 'memberReview',
      align: 'left',
      width: '40%',
    }
  ];

  async created() {
    await this.$store.dispatch('loading');

    try {
      this.userId = Number(this.$route.params.id);
      this.activities = await RemoteServices.getActivities();
      
      this.profile = await RemoteServices.getVolunteerProfile(this.userId);
      if (!this.profile.id ) {
        this.profile = await this.$store.getters.getVolunteerProfile;
        await this.$store.dispatch('setVolunteerProfile', null);
      }
    } catch (error) {
      await this.$store.dispatch('error', error);
    }
    await this.$store.dispatch('clearLoading');
  }

  newProfile() {
    this.createProfile = true;
  }

  onCloseVolunteerProfileDialog() {
    this.createProfile = false;
  }

  onCreateVolunteerProfile(volunteerProfile: VolunteerProfile) {
    this.profile = volunteerProfile;
    this.createProfile = false;
  }

  activityName(participation: Participation) {
    return this.activities.find(activity => activity.id == participation.activityId)?.name;
  }

  institutionName(participation: Participation) {
    let activity = this.activities.find(activity => activity.id == participation.activityId);
    return activity?.institution.name;
  }

  getMemberRating(participation: Participation): string {
    if (
      !participation ||
      participation.memberRating == null
    ) {
      return '';
    }
    return this.convertToStars(participation.memberRating);
  }

  convertToStars(rating: number): string {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(Math.floor(5 - rating));
    return `${fullStars}${emptyStars} ${rating}/5`;
  }
}
</script>

<style lang="scss" scoped>
.stats-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  align-content: center;
  height: 100%;

  .items {
    background-color: rgba(255, 255, 255, 0.75);
    color: #696969;
    border-radius: 5px;
    flex-basis: 25%;
    margin: 20px;
    cursor: pointer;
    transition: all 0.6s;
  }
}

.icon-wrapper,
.project-name {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper {
  font-size: 72px;
  transform: translateY(0px);
  transition: all 0.6s;
  width: 200px;
}

.icon-wrapper {
  align-self: end;
}

.project-name {
  align-self: start;
}

.project-name p {
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  transform: translateY(0px);
  transition: all 0.5s;
}

.items:hover {
  border: 3px solid black;

  & .project-name p {
    transform: translateY(-10px);
  }

  & .icon-wrapper i {
    transform: translateY(5px);
  }
}

.text-description {
  display: block;
  padding: 1em;
}
</style>