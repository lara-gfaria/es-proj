describe('ActivitySuggestion', () => {
    beforeEach(() => {
      cy.deleteAllButArs();
      cy.createDatabaseInfoForActivitySuggestion();
    });
  
    afterEach(() => {
      cy.deleteAllButArs();
    });
    
    it('create activity Suggestions', () => {
      const NAME = 'Cãominhada';
      const REGION = 'Lisboa';
      const NUMBER = '4';
      const DESCRIPTION = 'Uma caminhada com o teu cão';
      const INSTITUTION_ID = '1';
  
      cy.demoVolunteerLogin()
      // intercept create activity Suggestion request and inject date values in the request body
      cy.intercept('POST', '/activitySuggestions/institution/*', (req) => {
        req.body = {
          applicationDeadline: '2025-05-13T12:00:00+00:00',
          startingDate: '2025-05-23T12:00:00+00:00',
          endingDate: '2025-06-11T12:00:00+00:00'
        };
      }).as('register');
      // intercept get institutions
      cy.intercept('GET', '/activitySuggestions/volunteer').as('getActivitySuggestions');
      cy.intercept('GET', '/institutions').as('availableInstitutions');
      
      // go to create activity form
      cy.get('[data-cy="volunteerActivitySuggestions"]').click();
      cy.wait('@getActivitySuggestions');
      
      // check if Volunteer Activity Suggestions Table has 2 Suggestions
      cy.get('[data-cy="VolunteerActivitySuggestionsTable"] tbody tr')
      .should('have.length', 2)
      
      // click on new Activity Suggestion button
      cy.get('[data-cy="newActivitySuggestion"]').click();
      cy.wait('@availableInstitutions');
  
      // fill form
      cy.get('[data-cy="nameInput"]').type(NAME);
      cy.get('[data-cy="participantsNumberInput"]').type(NUMBER);
      cy.get('[data-cy="institutionDropDown"]').click();
      cy.get('.v-menu__content .v-list-item').should('be.visible').first().click();
      cy.get('[data-cy="regionInput"]').type(REGION);
      cy.get('[data-cy="descriptionInput"]').type(DESCRIPTION);

      cy.get('#applicationDeadlineInput-input').click();
      cy.selectDateTimePickerDate();
      cy.get('#startingDateInput-input').click({force: true});
      cy.get(".datetimepicker > .datepicker > .datepicker-buttons-container > .datepicker-button > .datepicker-button-content")
      .eq(1)
      .click({force: true});
      cy.get('#endingDateInput-input').click({force: true});
      cy.get(".datetimepicker > .datepicker > .datepicker-buttons-container > .datepicker-button > .datepicker-button-content")
      .eq(2)
      .click({force: true});
      // save form
      cy.get('[data-cy="createActivitySuggestion"]').click()
      // check request was done
      cy.wait('@register')
      // check results
      cy.get('[data-cy="VolunteerActivitySuggestionsTable"] tbody tr')
        .should('have.length', 3)
        .eq(0)
        .children()
        .should('have.length', 10)

      cy.get('[data-cy="VolunteerActivitySuggestionsTable"] tbody tr')
        .eq(0).children().eq(0).should('contain', NAME)
      cy.get('[data-cy="VolunteerActivitySuggestionsTable"] tbody tr')
        .eq(0).children().eq(1).should('contain', INSTITUTION_ID)
      cy.get('[data-cy="VolunteerActivitySuggestionsTable"] tbody tr')
        .eq(0).children().eq(4).should('contain', NUMBER)
      cy.logout();
  
    });

    it('approve and reject suggestion', () => {
      cy.demoMemberLogin()
      // intercept approve
      cy.intercept('PUT', '/activitySuggestions/*/approve').as('approve');
      // intercept get institutions
      cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
      // intercept requests
      cy.intercept('GET', '/activitySuggestions/institution/*').as('getActivitySuggestions');

      // go to  activity suggestion form
      cy.get('[data-cy="institution"]').click();

      cy.get('[data-cy="activitysuggestions"]').click();
      cy.wait('@getInstitutions');

      // check if first suggestion status is "IN_REVIEW"
      cy.get('[data-cy="InstitutionActivitySuggestionsTable"] tbody tr')
      .eq(0)
      .children()
      .eq(9)
      .should('contain', 'IN_REVIEW')

      // approve first suggestion
      cy.get('[data-cy="InstitutionActivitySuggestionsTable"] tbody tr')
      .eq(0)
      .children()
      .eq(10)
      .find('[data-cy="approveSuggestion"]')
      .click();
      cy.wait('@approve');

      cy.logout();

      // check results in volunteer view
      cy.demoVolunteerLogin();
      // intercept get institutions
      cy.intercept('GET', '/activitySuggestions/volunteer').as('getActivitySuggestions');

      // go to activity form
      cy.get('[data-cy="volunteerActivitySuggestions"]').click();
      cy.wait('@getActivitySuggestions');

      // check if same suggestion status is "IN_REVIEW"
      cy.get('[data-cy="VolunteerActivitySuggestionsTable"] tbody tr')
      .eq(0)
      .children()
      .eq(9)
      .should('contain', 'APPROVED')

      cy.logout();

      // reject same suggestion
      cy.demoMemberLogin();
      // intercept reject
      cy.intercept('PUT', '/activitySuggestions/*/reject').as('reject');
      // intercept get institutions
      cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
      // intercept requests
      cy.intercept('GET', '/activitySuggestions/institution/*').as('getActivitySuggestions');
      
      // go to activity suggestion form
      cy.get('[data-cy="institution"]').click();

      cy.get('[data-cy="activitysuggestions"]').click();
      cy.wait('@getInstitutions');
    
      // reject same suggestion
      cy.get('[data-cy="InstitutionActivitySuggestionsTable"] tbody tr')
      .eq(1)
      .children()
      .eq(10)
      .find('[data-cy="rejectSuggestion"]')
      .click();
      cy.wait('@reject');

      cy.logout();
      
      // check results in volunteer view
      cy.demoVolunteerLogin();
      // intercept get institutions
      cy.intercept('GET', '/activitySuggestions/volunteer').as('getActivitySuggestions');

      // go to activity form
      cy.get('[data-cy="volunteerActivitySuggestions"]').click();
      cy.wait('@getActivitySuggestions');

      // check if same suggestion status is "IN_REVIEW"
      cy.get('[data-cy="VolunteerActivitySuggestionsTable"] tbody tr')
      .eq(0)
      .children()
      .eq(9)
      .should('contain', 'REJECTED')

      cy.logout();
    });

  });

  