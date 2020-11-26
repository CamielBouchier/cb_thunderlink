////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// $BeginLicense$
// $EndLicense$
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var baseline =
    {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    OnDocumentReady :function()
        {
        //console.log("baseline.OnDocumentReady()")

        // Breakpoints.
		skel.breakpoints(
            {
			xlarge : '(max-width: 1680px)' ,
			large  : '(max-width: 1280px)' ,
			medium : '(max-width: 980px)'  ,
			small  : '(max-width: 736px)'  ,
			xsmall : '(max-width: 480px)'
		    })

        skel.on('change', baseline.OnBreakpointChange)
        $('#cbMenuToggle').on('click', baseline.OnMenuToggleClick)
        $(window).scroll(baseline.OnScroll)
        $(window).resize(baseline.OnScroll)
        },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    OnBreakpointChange : function()
        {
        //console.log("baseline.OnBreakpointChange()")
        if (skel.breakpoint("medium").active) 
            {
            $('#cbMenuToggle').css('display', 'inline-block')
            $('#cbNav').addClass('cbNoDisplay')
            $('#cbMenuToggle').removeClass('Close')
		    }
        else
            {
            $('#cbMenuToggle').css('display', 'none')
            $('#cbNav').removeClass('cbNoDisplay')
		    }
        },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    OnMenuToggleClick : function()
        {
        var $Nav = $('#cbNav')
        if ($Nav.hasClass('cbNoDisplay'))
            {
            $Nav.removeClass('cbNoDisplay')
            $('#cbMenuToggle').addClass('Close')
            }
        else
            {
            $Nav.addClass('cbNoDisplay')
            $('#cbMenuToggle').removeClass('Close')
            }
        },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    SB        : $('#cbSideBar'),
    MC        : $('#cbMainContainer'),
    PrevWP    : 0,
    Top       : false,
    Bottom    : false,
    TopOffset : 0,

    OnScroll : function()
        {
        // console.log("OnScroll()")
        var cbThis = baseline

        if (skel.breakpoint("medium").active) 
            {
            return
            }

        var SBH = cbThis.SB.height()
        var WP  = $(window).scrollTop()
		var WH  = $(window).height()
		var MCH = cbThis.MC.height()

		if (SBH > WH) 
            {
			if (WP > cbThis.PrevWP) 
                {
				if (cbThis.Top) 
                    {
					cbThis.Top = false
					cbThis.TopOffset = (cbThis.SB.offset().top > 0) ? cbThis.SB.offset().top : 0
					cbThis.SB.attr('style', 'top: ' + cbThis.TopOffset + 'px;')
				    } 
                else if (!cbThis.Bottom && WP + WH > SBH + cbThis.SB.offset().top && SBH < MCH) 
                    {
					cbThis.Bottom = true
					cbThis.SB.attr('style', 'position: fixed; bottom: 0;')
				    }
			    } 
            else if ( WP < cbThis.PrevWP ) 
                {
				if ( cbThis.Bottom ) 
                    {
					cbThis.Bottom = false
					cbThis.TopOffset = (cbThis.SB.offset().top > 0) ? cbThis.SB.offset().top  : 0
					cbThis.SB.attr('style', 'top: ' + cbThis.TopOffset + 'px;')
				    } 
                else if (! cbThis.Top && WP < cbThis.SB.offset().top) 
                    {
					cbThis.Top = true
					cbThis.SB.attr('style', 'position: fixed;')
				    }
			    } 
            else 
                {
				cbThis.Top = cbThis.Bottom = false
				cbThis.TopOffset = (cbThis.SB.offset().top > 0) ? cbThis.SB.offset().top : 0
				cbThis.SB.attr('style', 'top: ' + cbThis.TopOffset + 'px;')
			    }
		    } 
        else if (! cbThis.Top) 
            {
			cbThis.Top = true
			cbThis.SB.attr('style', 'position: fixed;')
		    }

		cbThis.PrevWP = WP
        },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {baseline.OnDocumentReady()})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=120 lines=45
