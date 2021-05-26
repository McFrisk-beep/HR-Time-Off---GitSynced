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
			log.error({
				title: e.name,
				details: e.message
			});			
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
             }
         }
         catch(e){
             
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
     function afterSubmit(scriptContext) {
 
     }
 
 
     return {
         beforeLoad: beforeLoad,
         beforeSubmit: beforeSubmit,
        //  afterSubmit: afterSubmit
     };
     
 });
 