/**
 * de_dieploegers_admin_vacationView.js
 * 
 * Zimbra Vacation Admin Extension View
 * 
 * @author Dennis Ploeger <develop@dieploegers.de>
 * @license see LICENSE
 */

/**
 * Create vacation View
 */

de_dieploegers_admin_vacationView = function() {
    
};

/**
 * XFormModifier to create vacation tab in account view
 * 
 * @param xFormObject XForm Current form
 * @see XFormModifiers
 * @memberof de_dieploegers_admin_vacationView
 */

de_dieploegers_admin_vacationView.createTab = function(xFormObject) {

    var cnt, i, tabBar, vacationTab, vacationTabIx;

    /* find the SWITCH element which is the parent element for all tabs */

    cnt = xFormObject.items.length;

    i = 0;

    for (i = 0; i < cnt; i++) {

        if (xFormObject.items[i].type == "switch") {

            break; // index i now points to the SWITCH element

        }

    }

    // find the index of the next tab

    de_dieploegers_admin_vacation.vacationTabIx = ++this.TAB_INDEX;

    // tab bar is the element with index 1

    tabBar = xFormObject.items[1];

    // add the new tab button to the tab bar

    tabBar.choices.push({
        value : de_dieploegers_admin_vacation.vacationTabIx,
        label : de_dieploegers_admin_vacation.TAB_LABEL,
    });
    
    vacationTab = {
        type : _SUPER_TABCASE_,
        numCols : 1,
        caseVarRef : "currentTab",
        caseKey : de_dieploegers_admin_vacation.vacationTabIx,
        items : de_dieploegers_admin_vacationXForm.items,
        loadDataMethods: [de_dieploegers_admin_vacationView.handleTabSelect]
    };

    // Add the new tab to the list of tabs

    xFormObject.items[i].items.push(vacationTab);

};

/**
 * Handle the selection of our tab. Modify the form regarding fields, that have
 * no attributes.
 */

de_dieploegers_admin_vacationView.handleTabSelect = function() {
    
    var element,
        elements, 
        form,
        i,
        val;
    
    // Set checkbox vacationEnableTimePeriod
    
    form = this.getForm();
    
    if (form.getInstanceValue("currentTab") != 
        de_dieploegers_admin_vacation.vacationTabIx) {
        
        // We're not active currently, go ahead.
        
        return;
        
    }    
    
    if (form.getItemsById("vacationEnableTimePeriod")[0].getElement() == null) {
        
        /**
         * We do an ugly Time hack here, because we need the form to be drawn.
         * There has to be a better way than that!
         */
        
        AjxTimedAction.scheduleAction(
            new AjxTimedAction(
                this,
                de_dieploegers_admin_vacationView.handleTabSelect
            ),
            500
        );  

        
        return true;
        
    }
    
    // Update our non-attribute-handled form elements
    
    elements = [
        "vacationEnableTimePeriod",
        "vacationStartDate",
        "vacationStartTime",
        "vacationEndDate",
        "vacationEndTime",
        "vacationAllDay",
        "vacationCalendarEnable"
    ];
    
    element = "";
    
    for (i = 0; i < elements.length; i = i + 1) {
        
        element = elements[i];
        val = de_dieploegers_admin_vacation[element];
        
        if (typeof val == "boolean") {
            
            val = "FALSE";
            
            if (de_dieploegers_admin_vacation[element]) {
                val = "TRUE";
            }
            
        }
        
        form.getItemsById(element)[0].__attributes.value =
            val;
        form.getItemsById(element)[0].updateElement(
            val
        );
    }
    
};

/**
 * setView-Method to set specific instance values for our app
 * 
 * @param entry XModel Current account 
 * @memberof de_dieploegers_admin_vacationView
 */

de_dieploegers_admin_vacationView.setView = function(entry) {

    // Fill date/time fields correctly

    var form, genTime, startTime, soapDoc;

    form = ZaApp.getInstance().getAppViewMgr().getCurrentViewContent()
        .getMyForm();
    
    timeFormat = new AjxDateFormat("HH:mm");
    
    // Set default value for AllDay
    
    de_dieploegers_admin_vacation.vacationAllDay = false;

    if (
        (!entry.attrs.hasOwnProperty("zimbraPrefOutOfOfficeFromDate")) || 
        (!entry.attrs.hasOwnProperty("zimbraPrefOutOfOfficeUntilDate"))
    ) {

        // Dates not set. Disable "vacationEnableTimePeriod" checkbox

        de_dieploegers_admin_vacation.vacationEnableTimePeriod = false;
        de_dieploegers_admin_vacation.vacationOriginalEnableTimePeriod = false;
        de_dieploegers_admin_vacation.vacationStartTime = timeFormat.format(new Date());
        de_dieploegers_admin_vacation.vacationEndTime = timeFormat.format(new Date());

    } else {
        
        de_dieploegers_admin_vacation.vacationEnableTimePeriod = false;

        genTime = new AjxDateFormat("yyyyMMddHHmmss'Z'");

        startTime = genTime.parse(
            entry.attrs[ZaAccount.A_zimbraPrefOutOfOfficeFromDate]
        );
        endTime = genTime.parse(
            entry.attrs[ZaAccount.A_zimbraPrefOutOfOfficeUntilDate]
        );

        // Apply Timezone

        startTime = AjxTimezone.convertTimezone(
            startTime, 
            AjxTimezone.GMT,
            de_dieploegers_admin_vacationController.additionalAccountInformation.prefs.zimbraPrefTimezoneId
        );

        endTime = AjxTimezone.convertTimezone(
            endTime, 
            AjxTimezone.GMT,
            de_dieploegers_admin_vacationController.additionalAccountInformation.prefs.zimbraPrefTimezoneId
        );        

        de_dieploegers_admin_vacation.vacationEnableTimePeriod = true;
        de_dieploegers_admin_vacation.vacationOriginalEnableTimePeriod = true;
        
        de_dieploegers_admin_vacation.vacationStartDate = startTime;

        de_dieploegers_admin_vacation.vacationStartTime = AjxDateFormat.format(
            "HH:mm",
            startTime
        ); 

        de_dieploegers_admin_vacation.vacationEndDate = endTime;

        de_dieploegers_admin_vacation.vacationEndTime = AjxDateFormat.format(
            "HH:mm",
            endTime
        ); 

        // Find out, if allDay should be set

        if ((startTime.getHours() == 0) && (startTime.getMinutes() == 0)
            && (startTime.getSeconds() == 0) && (endTime.getHours() == 23)
            && (endTime.getMinutes() == 59) && (endTime.getSeconds() == 59)

        ) {
            de_dieploegers_admin_vacation.vacationAllDay = true;
        }

    }

    /**
     * Set zimbraPrefOutOfOfficeFreeBusyStatus, as it is not defined as a
     * ZaAccount Attribute currently
     */

    form.setInstanceValue(
        form.getInstance().attrs.zimbraPrefOutOfOfficeFreeBusyStatus,
        "zimbraPrefOutOfOfficeFreeBusyStatus");

    // Get user prefs

    soapDoc = AjxSoapDoc.create("GetMailboxMetadataRequest", "urn:zimbraMail");
    soapDoc.set("meta", "").setAttribute("section", "zwc:implicit");

    ZaRequestMgr.invoke({
        soapDoc : soapDoc,
        noAuthToken : true,
        accountId : entry.attrs.zimbraId,
        asyncMode : true,
        callback : new AjxCallback(
            de_dieploegers_admin_vacationController.handleMetadataResponse,
            [
                form
            ]
        )
    }, {
        controller : ZaApp.getInstance().getCurrentController(),
        busyMsg : ZaMsg.BUSY_GET_RESOURCE
    });

};

