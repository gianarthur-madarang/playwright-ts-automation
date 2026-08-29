@login
Feature: Login to OrangeHRM

  # Target: OrangeHRM OS 5.9 public demo.
  # NOTE: the demo exposes only the Admin account, so the locked-out / no-access roles
  # covered in cpm-automation have no analogue here.

  @smoke
  Scenario: Log in as an authorized user
    Given I am on the login page
    When I log in as "Admin"
    Then the dashboard should be displayed
    And the logged in user name should be displayed

  Scenario: Log in with invalid credentials
    Given I am on the login page
    When I log in as "Invalid Credentials"
    Then the invalid credentials error should be displayed
    And I should remain on the login page

  Scenario: Submit the login form with no credentials
    Given I am on the login page
    When I submit the login form with empty credentials
    Then required field errors should be displayed
    And I should remain on the login page
