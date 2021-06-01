/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/search', 'N/runtime', 'N/format'],
 /**
  * @param {record} record
  * @param {search} search
  */
 function(record, search, runtime, format) {
     /**
      * Marks the beginning of the Map/Reduce process and generates input data.
      *
      * @typedef {Object} ObjectRef
      * @property {number} id - Internal ID of the record instance
      * @property {string} type - Record type id
      *
      * @return {Array|Object|Search|RecordRef} inputSummary
      * @since 2015.1
      */
     function getInputData() {
        //Used a built-in Saved Search to prevent tampering the data search for use.
        //Unless there's an update with the Formula field, then it's in the best intention to prevent users from modifying the formula especially.
        var policySearch = search.create({
            type: "customrecord_atstratus_leave_policy",
            filters:
            [
               ["custrecord_atstratus_isactive","is","T"]
            ],
            columns:
            [
               search.createColumn({
                  name: "custrecord_atstratus_policyapplicable",
                  sort: search.Sort.DESC,
                  label: "Time Off Policy"
               }),
               search.createColumn({name: "custrecord_atstratus_policytype", label: "Policy Type"}),
               search.createColumn({
                  name: "custrecord_atstratus_dateapplicable",
                  sort: search.Sort.ASC,
                  label: "Start Date Applicable"
               }),
               search.createColumn({name: "custrecord_atstratus_leaveaccrued", label: "Leave Accrued"}),
               search.createColumn({name: "custrecord_atstratus_leaveused", label: "Leave Used"}),
               search.createColumn({name: "custrecord_atstratus_leaverem", label: "Leave Remaining"}),
               search.createColumn({
                  name: "custrecord_atstratus_isactive",
                  sort: search.Sort.ASC,
                  label: "Is Active?"
               }),
               search.createColumn({
                  name: "custrecord_atstratus_pr_policy_hours",
                  join: "CUSTRECORD_ATSTRATUS_POLICYAPPLICABLE",
                  label: "Number of Days"
               }),
               search.createColumn({
                  name: "formulanumeric",
                  formula: "ROUND(({custrecord_atstratus_policyapplicable.custrecord_atstratus_pr_policy_hours}*(ABS(TO_DATE({today})-TO_DATE({custrecord_atstratus_dateapplicable}))/NULLIF(ABS(TO_DATE({custrecord_atstratus_policyapplicable.custrecord_atstratus_pr_policy_enddate})-TO_DATE({custrecord_atstratus_policyapplicable.custrecord_atstratus_pr_policy_startdate})),0))) , 0)",
                  label: "Formula (Numeric)"
               })
            ]
         });
         var searchResultCount = policySearch.runPaged().count;
         log.debug("policySearch result count",searchResultCount);

         return policySearch;
     }
 
     /**
      * Executes when the map entry point is triggered and applies to each key/value pair.
      *
      * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
      * @since 2015.1
      */
     function map(context) {
        var searchResult = JSON.parse(context.value);
        //log.debug('MAP DATA', searchResult);

        //Update the Leave Accrued field on the Policy Record itself from the data from the Saved Search.
        try{
            log.debug('Calculated Leave Count', searchResult.values['formulanumeric']);
            var policyRecord = record.submitFields({
               type: searchResult.recordType,
               id: searchResult.id,
               values: {
                  'custrecord_atstratus_leaveaccrued': searchResult.values['formulanumeric']
               }
            });
            log.debug('policyRecord saved successfully', 'Internal ID: ' + policyRecord);
        }
        catch(e){
            log.error('Error occured on MAP', e);
        }
     }
 
     /**
      * Executes when the summarize entry point is triggered and applies to the result set.
      *
      * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
      * @since 2015.1
      */
     function summarize(summary) {
         //Summarize the data from the MAP/Reduce. For logging purposes.
         log.audit('Summary Data', summary);
         log.audit({
             title: 'Usage units consumed', 
             details: summary.usage
         });
         log.audit({
             title: 'Concurrency',
             details: summary.concurrency
         });
         log.audit({
             title: 'Number of yields', 
             details: summary.yields
         });
     }
 
     return {
         getInputData: getInputData,
         map: map,
         summarize: summarize
     };
 });
 