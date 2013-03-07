/**
 * de_dieploegers_admin_vacation.js
 * 
 * Zimbra Admin Extension to support changing the vacation settings of a user
 * 
 * Application Initialization
 *
 * @author Dennis Ploeger <develop@dieploegers.de>
 * @license see LICENSE
 */

// Set defaults

de_dieploegers_admin_vacation.vacationEnableTimePeriod = false;
     
de_dieploegers_admin_vacation.vacationStartDate = new Date();
de_dieploegers_admin_vacation.vacationStartTime = AjxDateFormat.format(
    "HH:mm",
    de_dieploegers_admin_vacation.vacationStartDate
); 
de_dieploegers_admin_vacation.vacationEndDate = new Date();
de_dieploegers_admin_vacation.vacationEndTime = AjxDateFormat.format(
    "HH:mm",
    de_dieploegers_admin_vacation.vacationEndDate
); 
de_dieploegers_admin_vacation.vacationAllDay = false;

de_dieploegers_admin_vacation.vacationCalendarEnable = false;

de_dieploegers_admin_vacation.vacationCalendarEnable = true;

de_dieploegers_admin_vacation.vacationCalApptId = -1;
de_dieploegers_admin_vacation.vacationOriginalCalApptId = -1;

// Get more information about the logged-in administrator (timezone for example)

new ZmCsfeCommand().invoke({
    soapDoc : AjxSoapDoc.create("GetInfoRequest", "urn:zimbraAccount", null),
    asyncMode : true,
    callback : de_dieploegers_admin_vacationController.handleGetInfo,
    noAuthToken : true,
    noSession : true
});

// Add our XForm

if (ZaTabView.XFormModifiers["ZaAccountXFormView"]) {
    ZaTabView.XFormModifiers["ZaAccountXFormView"].push(
        de_dieploegers_admin_vacationView.createTab
    );
}

// Register our "Set View" method

if (ZaController.setViewMethods["ZaAccountViewController"]) {
    ZaController.setViewMethods["ZaAccountViewController"].push(
        de_dieploegers_admin_vacationView.setView
    );
}

// Add our modify handler to the controller

ZaItem.modifyMethods["ZaAccount"].push(
    de_dieploegers_admin_vacationController.saveAccount
);