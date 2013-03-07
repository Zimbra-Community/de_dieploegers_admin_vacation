vacationExtension
=================

This extension enables administrators to modify the current out of office 
information for a user without switching to his or her mailbox view.

This basically incorporates the "Vacation" setting view used in Zimbra 8.x into
the account view of the Administration Console.

Installation
------------

Simply install the extension using the Admin Extensions UI in the 
Administration console.

Rights
------

With the current version of the zimlet, a delegated account needs this rights
to work with the zimlet:

  * The adminConsoleZimletRights for the de_dieploegers_admin_vacation-zimlet
    (Target "Zimlet", Target Name "de_dieploegers_admin_vacation",
     Right "adminConsoleZimletRights")
  * The following rights either globally or for specific domains:
    * listAccount - List accounts
    * getAccountInfo - Get information about THE CURRENT ADMIN ACCOUNT (like
                       the admin's timezone)
    * adminLoginAs - Used for handling of the OutOfOffice-appointment in
                     the target account's calendar
    * These additional attributes to generally set the OutOfOffice-features:
      * set.account.zimbraPrefOutOfOfficeReplyEnabled
      * set.account.zimbraPrefOutOfOfficeReply
      * set.account.zimbraPrefOutOfOfficeFreeBusyStatus
      * set.account.zimbraPrefOutOfOfficeFromDate
      * set.account.zimbraPrefOutOfOfficeUntilDate
    * Optionally adminConsoleSavedSearchRights to enable users to save specific 
      searches

Please note, that a deferred agent cannot change anything of a global 
administrator. So if you have accounts, that are global administrators you
sadly have to strip down these accounts. You can give them the following
rights so that they basically have all rights of a global administrator 
minus the ACL-management for objects:

  * adminConsoleRights
  * domainAdminRights
  * deployZimlet
  * Set-Rights for the global attribute config.zimbraMailPurgeSystemPolicy
  
There's currently no way around that and I believe there won't be one ever.

Notes
-----

This zimlet aims to be included into Zimbra core and thus works around currently
missing attributes in the Zimbra framework.

I think, that Zimbra's already on the way of altering the attributes around
the out of office-features, as some attributes are already included while
not being properly added to the Admin-Framework.

Because of this, these rather ugly hacks have been made:

  * The following attributes are locally managed by the zimlet, but SHOULD be
    enclosed into ZaAccount somewhere in the future to make the zimlet work
    properly with the XModel-framework:
    
        "vacationEnableTimePeriod" => Enable the time period selection
        "vacationStartDate" => the date-part of zimbraPrefOutOfOfficeFromDate
                               (as long as there's no equivalent date/time
                                selection available as a XForm-Item like
                                the one in the user frontend)
        "vacationStartTime" => the time-part of zimbraPrefOutOfOfficeFromDate
                               (see above)
        "vacationEndDate" => the date-part of zimbraPrefOutOfOfficeUntilDate
                             (see above)
        "vacationEndTime" => the time-part of zimbraPrefOutOfOfficeUntilDate
                             (see above)
        "vacationAllDay" => Is "all Day" selected?
        "vacationCalendarEnable" => Should an appointment be added to the 
                                    account's calendar?
                                    
  * Because we need to handle the attributes locally, two bad timing-hacks had
    to be made at lines 269 and 429 of de_dieploegers_admin_vacationController.js
    
  * Used SUPER_TABCASE and loadDataMethods to be able manage the form
    once our tab is selected

With the deeper knowledge of the XForm-framework and the influence to add
new attributes to the Account object, this zimlet can easily be adopted.

Feel free to do so!
