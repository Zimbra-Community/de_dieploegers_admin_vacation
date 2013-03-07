/**
 * de_dieploegers_admin_vacationController.js
 * 
 * Zimbra Vacation Admin Extension Controller
 * 
 * @author Dennis Ploeger <develop@dieploegers.de>
 * @license see LICENSE
 */

/**
 * Create vacationController
 */

de_dieploegers_admin_vacationController = function () {
    
};

/**
 * Additional information about the current administrator
 * 
 * @memberOf de_dieploegers_admin_vacationController
 */

de_dieploegers_admin_vacationController.additionalAccountInformation = {};

/**
 * Check a de_dieploegers_admin_vacation.<variable> for a given value and return
 * if the value matches.
 * 
 * @param variable String Variable name
 * @param value Mixed Value to check against
 * @return bool If Check was successfull
 */

de_dieploegers_admin_vacationController.checkVar = function (variable, value) {
    return de_dieploegers_admin_vacation[variable] == value;
};

/**
 * Delete Appointment, if one is set
 * 
 * @memberOf de_dieploegers_admin_vacationController
 */

de_dieploegers_admin_vacationController.deleteApt = function (tmpObj) {

    var soapDoc;
   
    if (de_dieploegers_admin_vacation.vacationOriginalCalApptId != -1) {
   
        itemWasDeleted = true;
        
        // Get the appointment
        
        soapDoc = AjxSoapDoc.create(
            "GetAppointmentRequest",
            "urn:zimbraMail",
            null
        );
        
        soapDoc.setMethodAttribute(
            "id",
            de_dieploegers_admin_vacation.vacationOriginalCalApptId
        );
        
        resp = ZaRequestMgr.invoke({
            soapDoc : soapDoc,
            noAuthToken : true,
            accountId : tmpObj.attrs.zimbraId
        }, {
            controller : ZaApp.getInstance().getCurrentController(),
            busyMsg : ZaMsg.BUSY_GET_RESOURCE
        });
        
        // Delete the appointment
        
        soapDoc = AjxSoapDoc.create(
            "CancelAppointmentRequest", 
            "urn:zimbraMail",
            null
        );
    
        soapDoc.setMethodAttribute(
            "id",
            de_dieploegers_admin_vacation.vacationOriginalCalApptId +
            "-" +
            resp.Body.GetAppointmentResponse.appt[0].inv[0].id
        );
        
        soapDoc.setMethodAttribute(
            "comp",                
            resp.Body.GetAppointmentResponse.appt[0].inv[0].compNum
        );
        
        resp = ZaRequestMgr.invoke({
            soapDoc : soapDoc,
            noAuthToken : true,
            accountId : tmpObj.attrs.zimbraId
        }, {
            controller : ZaApp.getInstance().getCurrentController(),
            busyMsg : ZaMsg.BUSY_GET_RESOURCE
        });  
        
        return true;
        
    }
    
    return false;
    
};

/**
 * Handle response for the additional information request
 * 
 * @param response ZmCsfeResult Response
 * @memberOf de_dieploegers_admin_vacationController
 */

de_dieploegers_admin_vacationController.handleGetInfo = function(response) {

    if (!response.isException()) {
        de_dieploegers_admin_vacationController.additionalAccountInformation =
            response.getResponse().Body.GetInfoResponse;
    }
};

/**
 * Handle response from metadata request
 * 
 * @param form   XForm        current form
 * @param result ZmCsfeResult Response
 * @memberOf de_dieploegers_admin_vacationController
 */

de_dieploegers_admin_vacationController.handleMetadataResponse = function(
    form, 
    result
) {

    var prefs;

    if (!result.isException()) {

        prefs = result.getResponse().Body.GetMailboxMetadataResponse.meta[0]._attrs;
        
        if ((prefs.hasOwnProperty("zimbraPrefOutOfOfficeCalApptID")) &&
            (prefs.zimbraPrefOutOfOfficeCalApptID != "-1")
        ) {

            de_dieploegers_admin_vacation.vacationCalendarEnable = true;

            de_dieploegers_admin_vacation.vacationCalApptId = prefs.zimbraPrefOutOfOfficeCalApptID;
            de_dieploegers_admin_vacation.vacationOriginalCalApptId = prefs.zimbraPrefOutOfOfficeCalApptID;

        } else {
            
            de_dieploegers_admin_vacation.vacationCalendarEnable = false;

            de_dieploegers_admin_vacation.vacationCalApptId = -1;
            de_dieploegers_admin_vacation.vacationOriginalCalApptId = -1;
            
        }

    }
};

/**
 * modifyMethod to save our settings when saving the account
 * 
 * @param mods Object   Modifications as recorded by the form (irrelevant to us)
 * @param tmpObj XModel Account to be saved
 * @memberOf de_dieploegers_admin_vacationController
 */

de_dieploegers_admin_vacationController.saveAccount = function (mods, tmpObj) {
    
    var comp,
        endTime,
        fba,
        inputTime,
        inv,
        itemWasCreated,
        itemWasDeleted,
        m,
        newCalId,
        resp,
        startTime,
        soapDoc,
        soapEndTime,
        soapStartTime;
    
    if (
        (tmpObj.attrs[ZaAccount.A_zimbraPrefOutOfOfficeReplyEnabled] == "TRUE")
    ) {
        
        if (
            (!de_dieploegers_admin_vacation.vacationEnableTimePeriod) &&
            (de_dieploegers_admin_vacation.vacationOriginalEnableTimePeriod)
        ) {
            
            // Turn off the time period.
            
            soapDoc = AjxSoapDoc.create(
                "ModifyAccountRequest", 
                ZaZimbraAdmin.URN, 
                null
            );
            
            soapDoc.set("id", this.id);
            
            soapDoc.set("a", "").setAttribute(
                "n",
                ZaAccount.A_zimbraPrefOutOfOfficeFromDate
            );
            soapDoc.set("a", "").setAttribute(
                "n",
                ZaAccount.A_zimbraPrefOutOfOfficeUntilDate
            );

            resp = ZaRequestMgr.invoke(
                {
                    soapDoc: soapDoc
                },
                {
                    controller:ZaApp.getInstance().getCurrentController(),
                    busyMsg: ZaMsg.BUSY_MODIFY_ACCOUNT
                }
            ).Body.ModifyAccountResponse;

            this.initFromJS(resp.account[0]);
            
            // Probably delete the appointment
            
            if (de_dieploegers_admin_vacationController.deleteApt(tmpObj)) {
                
                // Remove apptid
                
                soapDoc = AjxSoapDoc.create(
                    "SetMailboxMetadataRequest",
                    "urn:zimbraMail",
                    null
                );
                
                meta = soapDoc.set("meta");
                meta.setAttribute("section", "zwc:implicit");
                
                soapDoc.set("a", "-1", meta).setAttribute(
                    "n", 
                    "zimbraPrefOutOfOfficeCalApptID"
                );
                
                resp = ZaRequestMgr.invoke({
                    soapDoc : soapDoc,
                    noAuthToken : true,
                    accountId : tmpObj.attrs.zimbraId
                }, {
                    controller : ZaApp.getInstance().getCurrentController(),
                    busyMsg : ZaMsg.BUSY_GET_RESOURCE
                });
                
            }
            
            /**
             * Do a form refresh, but only after some time when all
             * changes have been applied. So wait a second.
             * 
             * This is a bad hack, but I currently have no other method
             * because of the special attributes.
             */
            
            AjxTimedAction.scheduleAction(new AjxTimedAction(
                    function () {
                        var form;
                        
                        form = ZaApp.getInstance().getAppViewMgr().getCurrentViewContent()
                        .getMyForm();
                        
                        de_dieploegers_admin_vacationView.setView(form.getInstance());
                        
                        form.refresh();
                    }
                ),
                1000
            );  
            
            return;
            
        } else if (
            (!de_dieploegers_admin_vacation.vacationEnableTimePeriod) &&
            (!de_dieploegers_admin_vacation.vacationOriginalEnableTimePeriod)
        ) {
            
            // Nothing interesting to us changed. We're done here.
            
            return;
            
        }
        
        /**
         * Build up the right datetime values for Start/Until
         * and probably add a calendar item
         */ 
              
        startTime = de_dieploegers_admin_vacation.vacationStartDate;
       
        endTime = de_dieploegers_admin_vacation.vacationEndDate;
        
        try {
        
            inputTime = AjxDateFormat.parse(
                "HH:mm", 
                de_dieploegers_admin_vacation.vacationStartTime
            );
            
            startTime.setHours(inputTime.getHours());
            startTime.setMinutes(inputTime.getMinutes());
            startTime.setSeconds(0);
    
            inputTime = AjxDateFormat.parse(
                "HH:mm", 
                de_dieploegers_admin_vacation.vacationEndTime
            );
            
            endTime.setHours(inputTime.getHours());
            endTime.setMinutes(inputTime.getMinutes());
            endTime.setSeconds(0);
            
        } catch (ex) {
            
            throw {
                code: AjxException.INVALID_PARAM,
                msg: de_dieploegers_admin_vacation.ERROR_TIME_FORMAT
            };
            
        }
        
        if (endTime.getTime() <= startTime.getTime()) {
            
            // End Time is before start time!
            
            throw {
                code: AjxException.INVALID_PARAM,
                msg: de_dieploegers_admin_vacation.ERROR_END_BEFORE_START
            };
            
        }
        
        /**
         * We assume, that an end Time always ends at the 59th second.
         */
        
        endTime.setSeconds(59);
        
        // Convert to GMT
        
        try {
        
            startTime = AjxTimezone.convertTimezone(
                startTime,            
                de_dieploegers_admin_vacationController.additionalAccountInformation.prefs.zimbraPrefTimezoneId,
                AjxTimezone.GMT
            );
    
            endTime = AjxTimezone.convertTimezone(
                endTime,         
                de_dieploegers_admin_vacationController.additionalAccountInformation.prefs.zimbraPrefTimezoneId,
                AjxTimezone.GMT
            );        
                
            // Format and save
            
            soapStartTime = AjxDateFormat.format(
                "yyyyMMdd'T'HHmmss'Z'",
                startTime
            ); 
            
            startTime = AjxDateFormat.format(
                "yyyyMMddHHmmss'Z'",
                startTime
            );
            
            soapEndTime = AjxDateFormat.format(
                "yyyyMMdd'T'HHmmss'Z'",
                endTime
            );
            
            endTime = AjxDateFormat.format(
                "yyyyMMddHHmmss'Z'",
                endTime
            );
            
            // Save the parameters
            
            soapDoc = AjxSoapDoc.create(
                "ModifyAccountRequest", 
                ZaZimbraAdmin.URN, 
                null
            );
            
            soapDoc.set("id", this.id);
            
            soapDoc.set("a", startTime).setAttribute(
                "n",
                ZaAccount.A_zimbraPrefOutOfOfficeFromDate
            );
            soapDoc.set("a", endTime).setAttribute(
                "n",
                ZaAccount.A_zimbraPrefOutOfOfficeUntilDate
            );

            resp = ZaRequestMgr.invoke(
                {
                    soapDoc: soapDoc
                },
                {
                    controller:ZaApp.getInstance().getCurrentController(),
                    busyMsg: ZaMsg.BUSY_MODIFY_ACCOUNT
                }
            ).Body.ModifyAccountResponse;

            this.initFromJS(resp.account[0]);
            
            /**
             * Do a form refresh, but only after some time when all
             * changes have been applied. So wait a second.
             * 
             * This is a bad hack, but I currently have no other method
             * because of the special attributes.
             */
            
            AjxTimedAction.scheduleAction(new AjxTimedAction(
                    function () {
                        var form;
                        
                        form = ZaApp.getInstance().getAppViewMgr().getCurrentViewContent()
                        .getMyForm();
                        
                        de_dieploegers_admin_vacationView.setView(form.getInstance());
                        
                        form.refresh();
                    }
                ),
                1000
            );            
       
        } catch (ex) {
            
            throw {
                code: AjxException.INVALID_PARAM,
                msg: de_dieploegers_admin_vacation.ERROR_CANNOT_SAVE_DATE
            };
            
        }
        
        // Delete a calendar item, if it existed
        
        itemWasDeleted = false;
        itemWasCreated = false;
        newCalId = -1;
        
        itemWasDeleted = de_dieploegers_admin_vacationController.deleteApt(
            tmpObj
        );
        
        // Create a calendar item, if selected
        
        if (de_dieploegers_admin_vacation.vacationCalendarEnable) {
            
            itemWasCreated = true;
            
            soapDoc = AjxSoapDoc.create(
                "CreateAppointmentRequest",
                "urn:zimbraMail",
                null
            );
            
            m = soapDoc.set("m");
            
            inv = soapDoc.set("inv", "", m);
            
            fba = "B";
            
            if (
                (tmpObj.hasOwnProperty("zimbraPrefOutOfOfficeFreeBusyStatus")) &&
                (tmpObj.zimbraPrefOutOfOfficeFreeBusyStatus == "OUTOFOFFICE")
            ) {
                fba = "O";
            } 
            
            comp = soapDoc.set("comp", "", inv);
            
            // Set Free/Busy. I still can't figure out, which one's the right
            
            comp.setAttribute("fba", fba);
            comp.setAttribute("fb", fba);
            comp.setAttribute("name", de_dieploegers_admin_vacation.CALENDAR_SUBJECT);
            
            if (de_dieploegers_admin_vacation.vacationAllDay) {
                comp.setAttribute("allDay", "1");
            }
            
            soapDoc.set("s", "", comp).setAttribute("d", soapStartTime);
            soapDoc.set("e", "", comp).setAttribute("d", soapEndTime);
            
            soapDoc.set("su", de_dieploegers_admin_vacation.CALENDAR_SUBJECT, m);
            
            resp = ZaRequestMgr.invoke({
                soapDoc : soapDoc,
                noAuthToken : true,
                accountId : tmpObj.attrs.zimbraId
            }, {
                controller : ZaApp.getInstance().getCurrentController(),
                busyMsg : ZaMsg.BUSY_GET_RESOURCE
            });

            newCalId = resp.Body.CreateAppointmentResponse.apptId;       
            
            /**
             * Save FreeBusy-Status to Account as it is not automatically
             * saved currently
             */
            
            soapDoc = AjxSoapDoc.create(
                "ModifyAccountRequest", 
                ZaZimbraAdmin.URN, 
                null
            );
            
            soapDoc.set("id", tmpObj.attrs.zimbraId);
            
            soapDoc.set(
                "a", 
                tmpObj.zimbraPrefOutOfOfficeFreeBusyStatus
            ).setAttribute("n", "zimbraPrefOutOfOfficeFreeBusyStatus");
            
            resp = ZaRequestMgr.invoke({
                soapDoc : soapDoc
            }, {
                controller : ZaApp.getInstance().getCurrentController(),
                busyMsg : ZaMsg.BUSY_GET_RESOURCE
            });
            
        }
        
        if (itemWasDeleted || itemWasCreated) {
        
            // Set the metadata
            
            soapDoc = AjxSoapDoc.create(
                "SetMailboxMetadataRequest",
                "urn:zimbraMail",
                null
            );
            
            meta = soapDoc.set("meta");
            meta.setAttribute("section", "zwc:implicit");
            
            soapDoc.set("a", newCalId, meta).setAttribute(
                "n", 
                "zimbraPrefOutOfOfficeCalApptID"
            );
            
            de_dieploegers_admin_vacation.vacationCalApptId = newCalId;
            de_dieploegers_admin_vacation.vacationOriginalCalApptId = newCalId;
            
            resp = ZaRequestMgr.invoke({
                soapDoc : soapDoc,
                noAuthToken : true,
                accountId : tmpObj.attrs.zimbraId
            }, {
                controller : ZaApp.getInstance().getCurrentController(),
                busyMsg : ZaMsg.BUSY_GET_RESOURCE
            });
            
        }
                
    }
};