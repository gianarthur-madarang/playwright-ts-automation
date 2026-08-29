@admin @jobTitles
Feature: Admin - Job Titles

  # This page exists in the POC to prove CommonUIPage generalises: every step below
  # except the form fill is shared with User Management, and JobTitlesPage adds almost nothing.

  Background:
    Given I logged in as "Admin"
    When I open the "Job Titles" page

  @smoke
  Scenario: The Job Titles page is displayed
    Then the "Job" main page should be displayed
    And the page table should be displayed

  Scenario: The table shows the expected columns
    Then the Job Titles columns should be displayed

  Scenario: The table supports bulk selection
    Then the select all checkbox should be displayed

  Scenario: The record count is displayed and consistent with the rows shown
    Then the record count should be displayed
    And the rows shown should be consistent with the record count

  Scenario: A job title is created and then removed
    When I click the Add button
    And I fill the job title form with a unique title
    And I click the "Save" button
    Then a success toast should be displayed
    When I open the "Job Titles" page
    Then the created job title should be listed
    When I delete the created job title
    Then the created job title should no longer be listed

  Scenario: Cancelling the delete dialog leaves the record in place
    When I click the "delete" action on the row for "Chief Executive Officer"
    Then the confirm dialog should be displayed
    When I cancel the delete dialog
    Then the row for "Chief Executive Officer" should be displayed
