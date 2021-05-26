/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/search', 'N/runtime', 'N/ui/message'],
 /**
  * @param {record} record
  * @param {runtime} runtime
  */
 function(record, search, runtime, message) {
 
     /**
      * Function definition to be triggered before record is loaded.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {string} scriptContext.type - Trigger type
      * @param {Form} scriptContext.form - Current form
      * @Since 2015.2
      */
     function beforeLoad(scriptContext) {
    	try{
			if((scriptContext.type).toLowerCase() == 'view'){	
				//Get the record
				var objCurrentRecord = scriptContext.newRecord;

				//Check if the show error field is checked
				var intStatusId = objCurrentRecord.getValue({
					fieldId: 'custrecord_atstratus_hr_lr_status'
				});
				log.debug('status',intStatusId);
				if(intStatusId == 2){
                    //Approved
					scriptContext.form.addPageInitMessage({
                        type: message.Type.CONFIRMATION,
                        title: 'This Leave Request has been Approved',
                        message: 'No action needed. For Record Deletion, please contact your System Administrator.'
                    }); 
				}
                else if(intStatusId == 1){
                    //Pending Approval
                    scriptContext.form.addPageInitMessage({
                        type: message.Type.INFORMATION,
                        title: 'This Leave Request is Pending Approval',
                        message: 'Record is locked. Approvers can Approve/Reject this record accordingly. Kindly await processing.'
                    }); 
                }
				else if(intStatusId == 3){
                    //Rejected
					scriptContext.form.addPageInitMessage({
                        type: message.Type.ERROR,
                        title: 'This Leave Request has been Rejected',
                        message: 'Creator of the Leave Request can modify the record to make changes to Re-submit for Approval.'
                    }); 
				}
                else if(intStatusId == 11){
                    //Open
					scriptContext.form.addPageInitMessage({
                        type: message.Type.INFORMATION,
                        title: 'This Leave Request is Open',
                        message: 'If you are the creator of the Leave Request, kindly click "Submit for Approval", to begin processing.'
                    }); 
                }
			}
		}catch(e){
            log.error('Error occurred on beforeLoad', e);		
		}
     }
 
 
     /**
      * Function definition to be triggered before record is loaded.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {Record} scriptContext.oldRecord - Old record
      * @param {string} scriptContext.type - Trigger type
      * @Since 2015.2
      */
     function beforeSubmit(scriptContext){
         try{
             if((scriptContext.type).toLowerCase() == 'delete'){
				//Get the record
				var objCurrentRecord = scriptContext.newRecord;

                //Delete the Calendar Event beforehand.
                record.delete({
                    type: record.Type.CALENDAR_EVENT,
                    id: objCurrentRecord.getValue({ fieldId: 'custrecord_atstratus_hr_lr_event'})
                });

                //Load the policy for update
                var policyRecordSearch = search.create({
                    type: "customrecord_atstratus_leave_policy",
                    filters:
                    [
                    ["custrecord_atstratus_employee","anyof", objCurrentRecord.getValue({ fieldId: 'custrecord_atstratus_hr_lr_employee'})], 
                    "AND", 
                    ["custrecord_atstratus_policytype","anyof", objCurrentRecord.getValue({ fieldId: 'custrecord_atstratus_hr_lr_time_off_type'})], 
                    "AND", 
                    ["custrecord_atstratus_isactive","is","T"], 
                    "AND", 
                    ["custrecord_atstratus_dateapplicable","within","thisyear"]
                    ],
                    columns:
                    [
                    search.createColumn({name: "internalid", label: "Internal ID"})
                    ]
                });

                policyRecordSearch.run().each(function(result){
                    //Load the policy record, and add however many leave the employee requested.
                    var policyLoad = record.load({
                        type: 'customrecord_atstratus_leave_policy',
                        id: result.getValue({ name: 'internalid'}),
                    });
                    policyLoad.setValue({
                        fieldId: 'custrecord_atstratus_leaveused',
                        value: (policyLoad.getValue({ fieldId: 'custrecord_atstratus_leaveused'}) - objCurrentRecord.getValue({ fieldId: 'custrecord_atstratus_hr_lr_duration'}))
                    });
                    policyLoad.save();
                    log.debug('Record successfully saved', result.getValue({ name: 'internalid'}));
        
                    //Ideally should only have one result, so we return false here.
                    return false;
                });
             }
         }
         catch(e){
             log.error('Error occurred on beforeSubmit', e);
         }
     }
 
 
     return {
         beforeLoad: beforeLoad,
         beforeSubmit: beforeSubmit
     };
     
 });
 