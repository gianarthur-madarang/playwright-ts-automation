@admin @userManagement
Feature: Admin - User Management main page

  # Verified against OrangeHRM OS 5.9: 34 records, 4 filters,
  # columns Username / User Role / Employee Name / Status / Actions.
  # No pagination assertion - no Admin page exceeds the 50-row page size.

  Background:
    Given I logged in as "Admin"
    When I open the "User Management" page

  @smoke
  Scenario: The User Management page is displayed
    Then the "User Management" main page should be displayed
    And the page table should be displayed

  Scenario: The table shows the expected columns
    Then the User Management columns should be displayed

  Scenario: The search panel shows the expected filters
    Then the User Management filters should be displayed

  Scenario: The Add button is available
    Then the Add button should be displayed

  Scenario: The record count is displayed and consistent with the rows shown
    Then the record count should be displayed
    And the rows shown should be consistent with the record count

  Scenario: Searching by an existing username filters the table
    When I search for the username "Admin"
    Then the row for "Admin" should be displayed
