/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/search', 'N/ui/dialog'],
 /**
  * @param {record} record
  * @param {search} search
  */
 function(record, search, dialog) {
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
 
        log.debug('fieldChanged executed', scriptContext.fieldId);
        try{
            //If Start or End date is modified, calculate for the days difference.
           if(scriptContext.fieldId == 'custrecord_atstratus_hr_lr_start_date' || scriptContext.fieldId == 'custrecord_atstratus_hr_lr_end_date'){
               if(currRec.getValue({ fieldId: 'custrecord_atstratus_hr_lr_start_date'}) && currRec.getValue({ fieldId: 'custrecord_atstratus_hr_lr_end_date'})){
                    var startDate = currRec.getValue({ fieldId: 'custrecord_atstratus_hr_lr_start_date'});
                    var endDate = currRec.getValue({ fieldId: 'custrecord_atstratus_hr_lr_end_date'});

                    //86,400,000 = 1-day.
                    var dayDifference = (endDate - startDate) / 86400000;
                    //Set the calculated difference
                    currRec.setValue({ fieldId: 'custrecord_atstratus_hr_lr_duration', value: dayDifference});
               }
           }
        }
        catch(e){
            log.error('Error occured on fieldChanged', e);
            return false;
        }
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
 
        log.debug('fieldChanged executed', scriptContext.fieldId);
        try{
            var startDate = currRec.getValue({ fieldId: 'custrecord_atstratus_hr_lr_start_date'});
            var endDate = currRec.getValue({ fieldId: 'custrecord_atstratus_hr_lr_end_date'});

            log.debug('Start date', startDate);
            log.debug('End date', endDate);

            var yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            
            //86,400,000 = 1-day.
            var dayDifference = (endDate - startDate) / 86400000;

            //Validators. Check for Date overlaps. There should be none before saving the record.
            if(yesterdayDate > startDate){
                dialog.alert({
                    title: 'Alert',
                    message: 'Start Date cannot be before today.'
                });
                return false;
            }
            if(yesterdayDate > endDate){
                dialog.alert({
                    title: 'Alert',
                    message: 'End Date cannot be before today.'
                });
                return false;
            }
            if(dayDifference <= 0){
                dialog.alert({
                    title: 'Alert',
                    message: 'Start Date cannot be after or on the End date.'
                });
                return false;
            }
        }
        catch(e){
            log.error('Error occured on fieldChanged', e);
            return false;
        }

        return true;
     }
 
     return {
         fieldChanged: fieldChanged,
         saveRecord: saveRecord
     };
     
 });
 