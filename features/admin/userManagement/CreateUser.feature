@admin @userManagement
Feature: Admin - Create a system user

  # The demo is shared, so usernames are generated per run (Auto-user-<timestamp>-<rand>)
  # and assertions never depend on a row position or a fixed total.

  Background:
    Given I logged in as "Admin"
    When I open the "User Management" page

  Scenario: The Add User form opens from the Add button
    When I click the Add button
    Then the user form should be displayed

  @smoke
  Scenario: A new system user is created
    When I click the Add button
    And I fill the user form with a unique username
    And I click the "Save" button
    Then a success toast should be displayed
    When I open the "User Management" page
    Then the created user should be listed
