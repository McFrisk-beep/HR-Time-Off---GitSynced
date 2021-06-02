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
            log.debug('fieldChanged executed', scriptContext.fieldId);
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

                    //TODO Calculate for the Quarters
                }
                else{
                    disableQuarter(currRec);
                }

                if(currRec.getText({ fieldId: 'custrecord_atstratus_pr_policy_per'}) == 'Annual'){

                    //WARNING: Possible issue in the future should the customer change their Date Formats.
                    //Probably need to handle these some time in the future.
                    var month, day, year;
                    var firstDay = new Date(new Date().getFullYear(), 0, 1)
                    month = firstDay.getMonth()+1;
                    day = firstDay.getDate();
                    year = firstDay.getFullYear();
                    firstDay = day + '/' + month + '/' + year;
                    firstDay = format.parse({ value: firstDay, type: format.Type.DATE});

                    var lastDay = new Date(new Date().getFullYear(), 11, 31)
                    month = lastDay.getMonth()+1;
                    day = lastDay.getDate();
                    year = lastDay.getFullYear();
                    lastDay = day + '/' + month + '/' + year;
                    lastDay = format.parse({ value: lastDay, type: format.Type.DATE});

                    currRec.setValue({ fieldId: 'custrecord_atstratus_pr_policy_startdate', value: firstDay});
                    currRec.setValue({ fieldId: 'custrecord_atstratus_pr_policy_enddate', value: lastDay});
                }
            }
         }
         catch(e){
             log.error('Error occured on fieldchanged', e);
         }

     }
 
     /**
      * Function to be executed when field is slaved.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      * @param {string} scriptContext.fieldId - Field name
      *
      * @since 2015.2
      */
     function postSourcing(scriptContext) {
 
     }
 
     /**
      * Function to be executed after sublist is inserted, removed, or edited.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @since 2015.2
      */
     function sublistChanged(scriptContext) {
 
     }
 
     /**
      * Function to be executed after line is selected.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @since 2015.2
      */
     function lineInit(scriptContext) {
 
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
 
     }
 
     /**
      * Validation function to be executed when sublist line is committed.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @returns {boolean} Return true if sublist line is valid
      *
      * @since 2015.2
      */
     function validateLine(scriptContext) {
 
     }
 
     /**
      * Validation function to be executed when sublist line is inserted.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @returns {boolean} Return true if sublist line is valid
      *
      * @since 2015.2
      */
     function validateInsert(scriptContext) {
 
     }
 
     /**
      * Validation function to be executed when record is deleted.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @returns {boolean} Return true if sublist line is valid
      *
      * @since 2015.2
      */
     function validateDelete(scriptContext) {
 
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
 
     }
 
     return {
         pageInit: pageInit,
         fieldChanged: fieldChanged
         // postSourcing: postSourcing,
         // sublistChanged: sublistChanged,
         // lineInit: lineInit,
         // validateField: validateField,
         // validateLine: validateLine,
         // validateInsert: validateInsert,
         // validateDelete: validateDelete,
         // saveRecord: saveRecord
     };
     
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

     function enableQuarter(currRec){
        var disableQuarter = currRec.getField({
            fieldId: 'custrecord_ats_quarter'
        });
        disableQuarter.isDisabled = false;
     }

     function disableQuarter(currRec){
        var disableQuarter = currRec.getField({
            fieldId: 'custrecord_ats_quarter'
        });
        disableQuarter.isDisabled = true;
        currRec.setValue({ fieldId: 'custrecord_ats_quarter', value: ''});
     }
 });
 