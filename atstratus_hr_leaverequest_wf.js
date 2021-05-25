/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {
    function onAction(scriptContext){
        var currRecord = scriptContext.newRecord;

        //Load the policy for update
        var policyRecordSearch = search.create({
            type: "customrecord_atstratus_leave_policy",
            filters:
            [
               ["custrecord_atstratus_employee","anyof", currRecord.getValue({ fieldId: 'custrecord_atstratus_hr_lr_employee'})], 
               "AND", 
               ["custrecord_atstratus_policytype","anyof", currRecord.getValue({ fieldId: 'custrecord_atstratus_hr_lr_time_off_type'})], 
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

        try{
            policyRecordSearch.run().each(function(result){
                //Load the policy record, and subtract however many leave the employee requested.
                //Negatives are possible at discretion.
                var policyLoad = record.load({
                    type: 'customrecord_atstratus_leave_policy',
                    id: result.getValue({ name: 'internalid'}),
                });
                policyLoad.setValue({
                    fieldId: 'custrecord_atstratus_leaveused',
                    value: (policyLoad.getValue({ fieldId: 'custrecord_atstratus_leaveused'}) + currRecord.getValue({ fieldId: 'custrecord_atstratus_hr_lr_duration'}))
                });
                policyLoad.save();
                log.debug('Record successfully saved', result.getValue({ name: 'internalid'}));
    
                //Ideally should only have one result, so we return false here.
                return false;
            });
        }
        catch(e){
            log.error({
                title: 'Error occurred',
                details: e
            });
        }

        return true;
    }
    return {
        onAction: onAction
    }
});