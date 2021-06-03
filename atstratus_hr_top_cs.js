/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/search', 'N/ui/dialog', 'N/runtime', 'N/format'],
 /**
  * @param {record} record
  * @param {search} search
  */
 function(record, search, dialog, runtime, format) {
     
     /**
      * Function to be executed after page is initialized.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
      *
      * @since 2015.2
      */
     function pageInit(scriptContext) {
        var currRec = scriptContext.currentRecord;

        try{
            //Disable the dates from being modified if they're NOT set to Custom
            if(currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == '' ||
            currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Annual' ||
            currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Quarterly'){

                disableFields(currRec);
            }

            //Toggle the Quarterly field if the Frequency is set to Quarterly
            if(currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Quarterly'){
                enableQuarter(currRec);
            }
            else{
                disableQuarter(currRec);
            }
        }
        catch(e){
            log.error('Error occured on pageinit', e);
        }
     }
 
     /**
      * Function to be executed when field is changed.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      * @param {string} scriptContext.fieldId - Field name
      * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
      * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
      *
      * @since 2015.2
      */
     function fieldChanged(scriptContext) {
         var currRec = scriptContext.currentRecord;

         try{
            //log.debug('fieldChanged executed', scriptContext.fieldId);
            if(scriptContext.fieldId == 'custrecord_atstratus_pr_policy_per'){
                //If CUSTOM, enable the fields from being modified.
                if(currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Custom'){
                    enableDateFields(currRec);
                }
                else{
                    disableFields(currRec);
                }

                //Toggle the Quarterly field if the Frequency is set to Quarterly
                if(currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Quarterly'){
                    enableQuarter(currRec);
                }
                else{
                    disableQuarter(currRec);
                }

                if(currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Annual'){
                    setAnnualDates(currRec);
                }
            }
            else if(scriptContext.fieldId == 'custrecord_ats_quarter'){
                //Set Quarters appropriately. Fixed 3-months = 1-quarter
                var month, day, year, quarterDate;

                //Passes the initial dates for the Quarters. The setQuarterDates function processes the calculation and setting of the Field Values
                switch(currRec.getText({ fieldId: 'custrecord_ats_quarter'})){
                    case 'Q1':
                        quarterDate = new Date(new Date().getFullYear(), 0, 1);
                        setQuarterDates(quarterDate, currRec, 31);
                        break;
                    case 'Q2':
                        quarterDate = new Date(new Date().getFullYear(), 3, 1);
                        setQuarterDates(quarterDate, currRec, 30);
                        break;
                    case 'Q3':
                        quarterDate = new Date(new Date().getFullYear(), 6, 1);
                        setQuarterDates(quarterDate, currRec, 30);
                        break;
                    case 'Q4':
                        quarterDate = new Date(new Date().getFullYear(), 9, 1);
                        setQuarterDates(quarterDate, currRec, 31);
                        break;
                    default:
                        //You dun goof'd up boi. Go back
                        //Only the defaults are accepted
                        currRec.setValue({ fieldId: 'custrecord_ats_quarter', value: '', ignoreFieldChange: true});
                        break;
                }
            }
         }
         catch(e){
             log.error('Error occured on fieldchanged', e);
         }

     }
 
     /**
      * Validation function to be executed when field is changed.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      * @param {string} scriptContext.fieldId - Field name
      * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
      * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
      *
      * @returns {boolean} Return true if field is valid
      *
      * @since 2015.2
      */
     function validateField(scriptContext) {
        var currRec = scriptContext.currentRecord;

        try{
            if((scriptContext.fieldId == 'custrecord_atstratus_pr_policy_startdate' || scriptContext.fieldId == 'custrecord_atstratus_pr_policy_enddate')
            && currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Custom'){

                if(currRec.getValue({ fieldId: 'custrecord_atstratus_pr_policy_startdate'}) != null
                && currRec.getValue({ fieldId: 'custrecord_atstratus_pr_policy_enddate'}) != null){

                    var startDate = currRec.getValue({ fieldId: 'custrecord_atstratus_pr_policy_startdate'});
                    var endDate = currRec.getValue({ fieldId: 'custrecord_atstratus_pr_policy_enddate'});
            
                    var yesterdayDate = new Date();
                    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                    
                    //86,400,000 = 1-day.
                    var dayDifference = (endDate - startDate) / 86400000;
            
                    //Validators. Check for Date overlaps. There should be none before saving the record.
                    // if(yesterdayDate > startDate){
                    //     dialog.alert({
                    //         title: 'Alert',
                    //         message: 'Start Date cannot be before today.'
                    //     });
                    //     return false;
                    // }
                    // if(yesterdayDate > endDate){
                    //     dialog.alert({
                    //         title: 'Alert',
                    //         message: 'End Date cannot be before today.'
                    //     });
                    //     return false;
                    // }
                    if(dayDifference < 0){
                        dialog.alert({
                            title: 'Alert',
                            message: 'Start Date cannot be after or on the End date.'
                        });
                        setAnnualDates(currRec);
                        return false;
                    }
                }
            }
        }
        catch(e){
            log.error('Error occurred on validateField', e);
            return false;
        }

        return true;
     }

     /**
      * Validation function to be executed when record is saved.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @returns {boolean} Return true if record is valid
      *
      * @since 2015.2
      */
      function saveRecord(scriptContext) {
        var currRec = scriptContext.currentRecord;

        if(currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Quarterly' && currRec.getText({ fieldId: 'custrecord_ats_quarter'}) == ''){
            dialog.alert({
                title: 'Alert',
                message: 'Select either Q1-Q4 on the Quarters to proceed.'
            });
            return false;
        }

        return true;
     }
 
     return {
         pageInit: pageInit,
         fieldChanged: fieldChanged,
         validateField: validateField,
         saveRecord: saveRecord
     };
     
     /*
        Enable the Date Fields
     */
     function enableDateFields(currRec){
        var disableStart = currRec.getField({
            fieldId: 'custrecord_atstratus_pr_policy_startdate'
        });
        disableStart.isDisabled = false;

        var disableEnd = currRec.getField({
            fieldId: 'custrecord_atstratus_pr_policy_enddate'
        });
        disableEnd.isDisabled = false;
     }

     /*
        Disable the Date Fields
     */
     function disableFields(currRec){
        var disableStart = currRec.getField({
            fieldId: 'custrecord_atstratus_pr_policy_startdate'
        });
        disableStart.isDisabled = true;

        var disableEnd = currRec.getField({
            fieldId: 'custrecord_atstratus_pr_policy_enddate'
        });
        disableEnd.isDisabled = true;
     }

     /*
        Enable the 'Quarter' field
     */
     function enableQuarter(currRec){
        var disableQuarter = currRec.getField({
            fieldId: 'custrecord_ats_quarter'
        });
        disableQuarter.isDisabled = false;
     }

     /*
        Disable the 'Quarter' field
     */
     function disableQuarter(currRec){
        var disableQuarter = currRec.getField({
            fieldId: 'custrecord_ats_quarter'
        });
        disableQuarter.isDisabled = true;
        currRec.setValue({ fieldId: 'custrecord_ats_quarter', value: '', ignoreFieldChange: true});
     }

     /*
        Calculate and Set the Quarter Dates accordingly
        WARNING: Possible issue in the future should the customer change their Date Formats.
        Probably need to handle these some time in the future.

        initialDate - Initial Start date for the quarter
        currRec - Current Record for full UI functionalities
        lastDay - Last day of the quarter month
     */
    function setQuarterDates(initialDate, currRec, lastDay){
        var month, day, year, parsedDate;
        month = initialDate.getMonth()+1;
        day = initialDate.getDate();
        year = initialDate.getFullYear();
        parsedDate = format.parse({ value: (day + '/' + month + '/' + year), type: format.Type.DATE});
        //log.debug('start', parsedDate);

        currRec.setValue({ fieldId: 'custrecord_atstratus_pr_policy_startdate', value: parsedDate, ignoreFieldChange: true});

        month += 2;
        day = lastDay;
        parsedDate = format.parse({ value: (day + '/' + month + '/' + year), type: format.Type.DATE});
        //log.debug('end', parsedDate);

        currRec.setValue({ fieldId: 'custrecord_atstratus_pr_policy_enddate', value: parsedDate, ignoreFieldChange: true});
    }

     /*
        Set Start date to 1st day of year, then End date to last day of year
        WARNING: Possible issue in the future should the customer change their Date Formats.
        Probably need to handle these some time in the future.

        currRec - Current Record for full UI functionalities
     */
    function setAnnualDates(currRec){
        var month, day, year;
        var firstDay = new Date(new Date().getFullYear(), 0, 1);
        month = firstDay.getMonth()+1;
        day = firstDay.getDate();
        year = firstDay.getFullYear();
        firstDay = day + '/' + month + '/' + year;
        firstDay = format.parse({ value: firstDay, type: format.Type.DATE});

        var lastDay = new Date(new Date().getFullYear(), 11, 31);
        month = lastDay.getMonth()+1;
        day = lastDay.getDate();
        year = lastDay.getFullYear();
        lastDay = day + '/' + month + '/' + year;
        lastDay = format.parse({ value: lastDay, type: format.Type.DATE});

        currRec.setValue({ fieldId: 'custrecord_atstratus_pr_policy_startdate', value: firstDay, ignoreFieldChange: true});
        currRec.setValue({ fieldId: 'custrecord_atstratus_pr_policy_enddate', value: lastDay, ignoreFieldChange: true});
    }
 });
 