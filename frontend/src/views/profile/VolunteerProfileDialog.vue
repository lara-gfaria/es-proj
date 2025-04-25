<template>
    <v-dialog 
        v-model="dialog"
        width="1300"
        @input="$emit('close-volunteer-profile-dialog')"
        @keydown.esc="$emit('close-volunteer-profile-dialog')"
    >
        <v-card>
            <v-card-title>
                <span class="headline">
                    New Volunteer Profile
                </span>
            </v-card-title>

            <v-card-text>
                <v-form ref="form" lazy-validation>
                    <v-text-field
                        v-model="newVolunteerProfile.shortBio"
                        :rules="[(v) => !!v || 'ShortBio is required']"
                        label="*ShortBio"
                        required
                        data-cy="shortBio"
                    ></v-text-field>
                </v-form>
                <span class="text-h6 font-weight-bold">Selected Participations</span>
            </v-card-text>
            
            <v-card class="table" style="max-height: 300px; overflow-y: auto;">
                <v-data-table
                    v-model="newVolunteerProfile.selectedParticipations"
                    :headers="headers"
                    :items="participations"
                    :search="search"
                    disable-pagination
                    :hide-default-footer="true"
                    :mobile-breakpoint="0"
                    item-value="id"
                    return-object
                    show-select
                    data-cy="selectedParticipationsTable"
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
                        </v-card-title>
                    </template>
                    <template v-slot:item.activityName="{ item }">
                        {{ activityName(item) }}
                    </template>
                    <template v-slot:item.institutionName="{ item }">
                        {{ institutionName(item) }}
                    </template>
                    <template v-slot:item.memberRating="{ item }">
                        <div v-if="item.memberRating !== null">
                            <span class="text-h6">
                                {{ convertToStars(item.memberRating) }}
                            </span>
                            <br>
                            <span>{{ item.memberRating }}/5</span>
                        </div>
                    </template>
                </v-data-table>
            </v-card>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="$emit('close-volunteer-profile-dialog')"
                >
                Close
                </v-btn>
                <v-btn
                    v-if="newVolunteerProfile.shortBio"
                    color="blue-darken-1"
                    @click="createVolunteerProfile"
                    variant="text"
                    data-cy="saveButton"
                >
                Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import Activity from "@/models/activity/Activity";
import RemoteServices from "@/services/RemoteServices";
import Participation from "@/models/participation/Participation";
import VolunteerProfile from "@/models/profiles/VolunteerProfile";

@Component({
})
export default class VolunteerProfileDialog extends Vue {
    @Model('dialog', Boolean) dialog!: boolean;
    @Prop({ type: Array, required: true }) readonly activities!: Activity[];
    
    search: string = '';
    
    participations: Participation[] = [];
    
    newVolunteerProfile: VolunteerProfile = new VolunteerProfile();

    headers: object = [
        {
            text:'Activity Name',
            value: 'activityName',
            align: 'left',
            width: '30%',
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
            width: '10%',
        },
        {
            text: 'Review',
            value: 'memberReview',
            align: 'left',
            width: '30%',
        },
        {
            text: 'Acceptance Date',
            value: 'acceptanceDate',
            align: 'left',
            width: '10%',
        },
    ];

    async created() {
        await this.$store.dispatch('loading');
        try {
            this.participations = await RemoteServices.getVolunteerParticipations();
        } catch (error) {
        await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }

    activityName(participation: Participation) {
        return this.activities.find(activity => activity.id == participation.activityId)?.name;
    }

    institutionName(participation: Participation) {
        let activity = this.activities.find(activity => activity.id == participation.activityId);
        return activity?.institution.name;
    }

    convertToStars(rating: number): string {
        const fullStars = '★'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(Math.ceil(5 - rating));
        return `${fullStars}${emptyStars}`;
    }

    async createVolunteerProfile() {
        if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
            try {
                const result = await RemoteServices.createVolunteerProfile(this.newVolunteerProfile);
                
                this.$emit('create-volunteer-profile', result);
            } catch (error) {
                await this.$store.dispatch('error', error);
            }
        }
    }
}
</script>

<style scoped lang="scss"></style>