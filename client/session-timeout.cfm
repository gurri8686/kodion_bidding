<script src="<cfoutput>#includePath#</cfoutput>assets/extra-libs/jquery-sessiontimeout/jquery.sessionTimeout.min.js"></script>
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>

<cfoutput>
<script>
$.sessionTimeout({
  //message:'Your session is about to expire.',
  keepAliveUrl:'labels-manage.cfm',
  keepAliveAjaxRequestType:'POST',
  redirUrl:'<cfif isDefined("includePath")>#includePath#</cfif>../admin.cfm?key=#application.loginKey#',
  logoutUrl:'<cfif isDefined("includePath")>#includePath#</cfif>logout.cfm?key=#application.loginKey#',
  warnAfter: 3500000,
  redirAfter: 3600000,
  appendTime:true
});
</script>
</cfoutput>
