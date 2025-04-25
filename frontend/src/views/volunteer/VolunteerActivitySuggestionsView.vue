<template>
  <v-card class="table">
    <v-data-table
      :headers="headers"
      :items="activitySuggestions"
      :search="search"
      disable-pagination
      :hide-default-footer="true"
      :mobile-breakpoint="0"
      data-cy="VolunteerActivitySuggestionsTable"
    >
      <template v-slot:top>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            class="mx-2"
          />
          <v-spacer />
          <v-btn color="primary" dark @click="newActivitySuggestion" data-cy="newActivitySuggestion"
            >New Activity Suggestion</v-btn
          >
        </v-card-title>
      </template>
    </v-data-table>
    <activitySuggestion-dialog
      v-if="currentActivitySuggestion && editActivitySuggestionDialog"
      v-model="editActivitySuggestionDialog"
      :activitySuggestion="currentActivitySuggestion"
      v-on:create-activity="onCreateActivitySuggestion"
      v-on:close-activitySuggestion-dialog="onCloseActivitySuggestionDialog"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActivitySuggestion from '@/models/activitysuggestion/ActivitySuggestion';
import RemoteServices from "@/services/RemoteServices";
import ActivitySuggestionDialog from '@/views/volunteer/ActivitySuggestionDialog.vue';

@Component({
  components: {
    'activitySuggestion-dialog': ActivitySuggestionDialog,
  },
})
export default class VolunteerActivitySuggestionsView extends Vue {
  activitySuggestions: ActivitySuggestion[] = [];
  search: string = '';
  
  currentActivitySuggestion: ActivitySuggestion | null = null;
  editActivitySuggestionDialog: boolean = false;

  headers: object = [
    {
      text: 'Name',
      value: 'name',
      align: 'left',
      width: '10%',
    },
    {
      text: 'Institution',
      value: 'institutionId',
      align: 'left',
      width: '10%',
    },
    {
      text: 'Description',
      value: 'description',
      align: 'left',
      width: '30%',
    },
    {
      text: 'Region',
      value: 'region',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participants Limit',
      value: 'participantsNumberLimit',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Start Date',
      value: 'formattedStartingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'End Date',
      value: 'formattedEndingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Application Deadline',
      value: 'formattedApplicationDeadline',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Creation Date',
      value: 'creationDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'State',
      value: 'state',
      align: 'left',
      width: '5%',
    },
  ];

  async created() {
    await this.$store.dispatch('loading');
    try {
      this.activitySuggestions = await RemoteServices.getVolunteerActivitySuggestions();
    } catch (error) {
      await this.$store.dispatch('error', error);
    }
    await this.$store.dispatch('clearLoading');
  }

  newActivitySuggestion() {
    this.currentActivitySuggestion = new ActivitySuggestion();
    this.editActivitySuggestionDialog = true;
  }

  onCloseActivitySuggestionDialog() {
    this.currentActivitySuggestion = null;
    this.editActivitySuggestionDialog = false;
  }

  onCreateActivitySuggestion(activitySuggestion: ActivitySuggestion) {
    this.activitySuggestions = this.activitySuggestions.filter(
      (a) => a.id !== activitySuggestion.id,
    );
    this.activitySuggestions.unshift(activitySuggestion);
    this.editActivitySuggestionDialog= false;
    this.currentActivitySuggestion = null;
  }

}

</script>

<style lang="scss" scoped>
.date-fields-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-fields-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
</style>