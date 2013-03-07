/**
 * de_dieploegers_admin_vacationXForm.js
 * 
 * XForm-Items for the "Out of office" tab
 * 
 * @author Dennis Ploeger <develop@dieploegers.de>
 * @license see LICENSE
 */

de_dieploegers_admin_vacationXForm = function () {
    
};

de_dieploegers_admin_vacationXForm.items = [
    {

        // Tab to be shown in Zimbra Account-Management

        type : _ZA_TOP_GROUPER_,
        numCols : 2,
        label : de_dieploegers_admin_vacation.TAB_HEADER,
        items : [

            // First Checkbox to enable Out Of Office

            {
                type : _CHECKBOX_,
                label : de_dieploegers_admin_vacation.OUTOFOFFICE_SEND,
                ref : ZaAccount.A_zimbraPrefOutOfOfficeReplyEnabled,
                trueValue : "TRUE",
                falseValue : "FALSE"
            },

            // Auto-Reply-Message

            {
                type : _TEXTAREA_,
                label : de_dieploegers_admin_vacation.AUTOREPLY_MESSAGE,
                ref : ZaAccount.A_zimbraPrefOutOfOfficeReply,
                enableDisableChecks : [
                    [
                        XForm.checkInstanceValue,
                        ZaAccount.A_zimbraPrefOutOfOfficeReplyEnabled,
                        "TRUE"
                    ]
                ],
                enableDisableChangeEventSources : [
                    ZaAccount.A_zimbraPrefOutOfOfficeReplyEnabled
                ],
                id : "vacationAutoreplyMessage"
            },

            // Time-Settings group

            {
                type : _GROUP_,
                label : de_dieploegers_admin_vacation.TIME_PERIOD,
                enableDisableChecks : [
                    [
                        XForm.checkInstanceValue,
                        ZaAccount.A_zimbraPrefOutOfOfficeReplyEnabled,
                        "TRUE"
                    ]
                ],
                enableDisableChangeEventSources : [
                    ZaAccount.A_zimbraPrefOutOfOfficeReplyEnabled
                ],
                id : "vacationTimeGroup",
                numCols : 1,
                items : [
                    {
                        type : _GROUP_,
                        numCols : 2,
                        items : [
                            {
                                type : _GROUP_,
                                label : "",
                                numCols : 2,
                                items : [
                                    {

                                        // Enable timed Auto-Reply

                                        type : _CHECKBOX_,
                                        label : de_dieploegers_admin_vacation.TIME_PERIOD_SEND,
                                        labelLocation : _RIGHT_,
                                        id : "vacationEnableTimePeriod",
                                        trueValue : "TRUE",
                                        falseValue : "FALSE",
                                        onChange: function(value, event, form) {
                                            
                                            if (value == "TRUE") {
                                                de_dieploegers_admin_vacation.vacationEnableTimePeriod = true;
                                            } else {
                                                de_dieploegers_admin_vacation.vacationEnableTimePeriod = false;
                                            }              
                                            
                                            this.__attributes.value = value;
                                            
                                            form.refresh();
                                            
                                            return value;
                                        },
                                        
                                    }
                                ]
                            },
                            {
                                /**
                                 * Start-Time Setting (including
                                 * All-Day-Checkbox for both start and end-
                                 * time)
                                 * 
                                 * (filled during setView)
                                 *  => zimbraPrefOutOfOfficeStartTime
                                 */

                                type : _GROUP_,
                                label : de_dieploegers_admin_vacation.TIME_START,
                                numCols : 4,
                                enableDisableChecks : [
                                    [
                                        de_dieploegers_admin_vacationController.checkVar,
                                        "vacationEnableTimePeriod",
                                        true
                                    ]
                                ],
                                enableDisableChangeEventSources : [
                                    "vacationEnableTimePeriod"
                                ],
                                items : [
                                    {
                                        type : _DWT_DATE_,
                                        id : "vacationStartDate",
                                        onChange: function(value, event, form) {
                                            
                                            de_dieploegers_admin_vacation.vacationStartDate = value;
                                            
                                            this.__attributes.value = value;
                                            
                                            form.refresh();
                                            
                                            return value;
                                        },
                                    },
                                    {
                                        type : _TEXTFIELD_,
                                        id : "vacationStartTime",
                                        enableDisableChecks : [
                                            [
                                                de_dieploegers_admin_vacationController.checkVar,
                                                "vacationAllDay",
                                                false
                                            ]
                                        ],
                                        enableDisableChangeEventSources : [
                                            "vacationAllDay"
                                        ],
                                        onChange: function(value, event, form) {
                                            
                                            de_dieploegers_admin_vacation.vacationStartTime = value;
                                            
                                            this.__attributes.value = value;
                                            
                                            form.refresh();
                                            
                                            return value;
                                        },
                                    },
                                    {
                                        type : _CHECKBOX_,
                                        id : "vacationAllDay",
                                        label : de_dieploegers_admin_vacation.TIME_ALL_DAY,
                                        trueValue : "TRUE",
                                        falseValue : "FALSE",
                                        onChange : function(value, event, form) {

                                            if (value == "TRUE") {

                                                de_dieploegers_admin_vacation.vacationStartTime = "00:00";
                                                de_dieploegers_admin_vacation.vacationEndTime = "23:59";

                                                de_dieploegers_admin_vacation.vacationAllDay = true;
                                                
                                            } else {
                                                
                                                de_dieploegers_admin_vacation.vacationAllDay = false;
                                                
                                            }
                                            
                                            this.__attributes.value = value;
                                            
                                            form.refresh();
                                            
                                            return value;
                                            
                                        }
                                    }

                                ]
                            },
                            {
                                /**
                                 * End-Time Setting
                                 * 
                                 * (filled during setView)
                                 *  => zimbraPrefOutOfOfficeUntilTime
                                 */

                                type : _GROUP_,
                                label : de_dieploegers_admin_vacation.TIME_END,
                                numCols : 4,
                                enableDisableChecks : [
                                    [
                                        de_dieploegers_admin_vacationController.checkVar,
                                        "vacationEnableTimePeriod",
                                        true
                                    ]
                                ],
                                enableDisableChangeEventSources : [
                                    "vacationEnableTimePeriod"
                                ],
                                items : [
                                    {
                                        type : _DWT_DATE_,
                                        id : "vacationEndDate",
                                        onChange: function(value, event, form) {
                                            
                                            de_dieploegers_admin_vacation.vacationEndDate = value;
                                            
                                            this.__attributes.value = value;
                                            
                                            form.refresh();
                                            
                                            return value;
                                        },
                                    },
                                    {
                                        type : _TEXTFIELD_,
                                        id : "vacationEndTime",
                                        enableDisableChecks : [
                                            [
                                                de_dieploegers_admin_vacationController.checkVar,
                                                "vacationAllDay",
                                                false
                                            ]
                                        ],
                                        enableDisableChangeEventSources : [
                                            "vacationAllDay"
                                        ],
                                        onChange: function(value, event, form) {
                                            
                                            de_dieploegers_admin_vacation.vacationEndTime = value;
                                            
                                            this.__attributes.value = value;
                                            
                                            form.refresh();
                                            
                                            return value;
                                        },

                                    },
                                    {
                                        type : _CELL_SPACER_
                                    }
                                ]
                            },
                            {

                                /**
                                 * Feature to include vacation in account's
                                 * calendar
                                 */

                                type : _GROUP_,
                                label : de_dieploegers_admin_vacation.CALENDAR,
                                numCols : 3,
                                enableDisableChecks : [
                                    [
                                        de_dieploegers_admin_vacationController.checkVar,
                                        "vacationEnableTimePeriod",
                                        true
                                    ]
                                ],
                                enableDisableChangeEventSources : [
                                    "vacationEnableTimePeriod"
                                ],
                                items : [
                                    {
                                        type : _CHECKBOX_,
                                        id : "vacationCalendarEnable",
                                        trueValue : "TRUE",
                                        falseValue : "FALSE",
                                        onChange : function(value, event, form) {

                                            if (value == "TRUE") {

                                                de_dieploegers_admin_vacation.vacationCalendarEnable = true;
                                                
                                            } else {
                                                
                                                de_dieploegers_admin_vacation.vacationCalendarEnable = false;
                                                
                                            }
                                            
                                            this.__attributes.value = value;
                                            
                                            form.refresh();
                                            
                                            return value;
                                            
                                        }
                                    },
                                    {
                                        type : _OSELECT1_,
                                        label : de_dieploegers_admin_vacation.SHOW_FB,
                                        ref : "zimbraPrefOutOfOfficeFreeBusyStatus",
                                        enableDisableChecks : [
                                            [
                                                de_dieploegers_admin_vacationController.checkVar,
                                                "vacationCalendarEnable",
                                                true
                                            ]
                                        ],
                                        enableDisableChangeEventSources : [
                                            "vacationCalendarEnable"
                                        ],
                                        choices : [
                                            {
                                                value : "OUTOFOFFICE",
                                                label : de_dieploegers_admin_vacation.FB_OOO
                                            },
                                            {
                                                value : "BUSY",
                                                label : de_dieploegers_admin_vacation.FB_BUSY
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]