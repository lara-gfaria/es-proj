describe('VolunteerProfile', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createDemoEntities();
        cy.createDatabaseInfoForVolunteerProfile();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create volunteer profile', () => {
        const SHORT_BIO = 'This is a very short bio';
        const VOLUNTEER_NAME = 'DEMO-VOLUNTEER';
        const TOTAL_PARTICIPATIONS = 2;
        const ACTIVITY_NAME = 'A1';
        const INSTITUTION_NAME = 'DEMO INSTITUTION';
        const RATING = '★★★★★ 5/5';
        const REVIEW = 'A great member review!';

        cy.demoVolunteerLogin();

        // interceptors
        cy.intercept('GET', '/activities').as('getActivities');
        cy.intercept('GET', '/profile/volunteer/*').as('getProfile');
        cy.intercept('GET', '/participations/volunteer').as('getParticipations');
        cy.intercept('POST', '/profile/volunteer').as('createProfile');

        // go to profile view
        cy.get('[data-cy="profiles"').click();
        cy.get('[data-cy="volunteer-profile"').click();
        cy.wait('@getActivities');
        cy.wait('@getProfile');

        // go to create profile form
        cy.get('[data-cy="createProfile"]').click();
        cy.wait('@getParticipations');

        // fill form
        cy.get('[data-cy="shortBio"]').type(SHORT_BIO);
        cy.get('[data-cy="selectedParticipationsTable"] tbody tr')
            .should('have.length', 2)
            .eq(0)
            .find('.v-simple-checkbox')
            .click();
        cy.get('[data-cy="saveButton"]').click();
        
        cy.wait('@createProfile');
        
        // check results
        cy.get('[data-cy="volunteerName"]').should('contain', `Volunteer: ${VOLUNTEER_NAME}`);
        cy.get('[data-cy="shortBio"]').should('contain', SHORT_BIO);
        cy.get('[data-cy="numTotalParticipations"]').should('contain', TOTAL_PARTICIPATIONS);
        cy.get('.v-data-table').scrollIntoView().should('be.visible').find('tbody tr').should('have.length.at.least', 1);
        cy.get('[data-cy="selectedParticipationsTable"] tbody tr')
            .eq(0).children().eq(0).should('contain', ACTIVITY_NAME);
        cy.get('[data-cy="selectedParticipationsTable"] tbody tr')
            .eq(0).children().eq(1).should('contain', INSTITUTION_NAME);
        cy.get('[data-cy="selectedParticipationsTable"] tbody tr')
            .eq(0).children().eq(2).should('contain', RATING);
        cy.get('[data-cy="selectedParticipationsTable"] tbody tr')
            .eq(0).children().eq(3).should('contain', REVIEW);

        // logout
        cy.logout();

        // interceptors
        cy.intercept('GET', '/profile/volunteer/all').as('getAllVolunteerProfiles');
        
        // go to profile list view
        cy.get('[data-cy="profiles"').click();
        cy.get('[data-cy="view-profiles"').click();
        cy.wait('@getAllVolunteerProfiles');
        
        // check volunteer profile table
        cy.get('[data-cy="volunteerProfilesTable"] tbody tr')
            .eq(0).children().eq(0).should('contain', VOLUNTEER_NAME);
        cy.get('[data-cy="volunteerProfilesTable"] tbody tr')
            .eq(0).children().eq(1).should('contain', SHORT_BIO);
    })
})