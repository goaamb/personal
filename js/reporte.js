var db = openDatabase("personalPanchita", "1.0", "Administracion de Personal en Panchita", 50 * 1024 * 1024);
var existeFuncion = false;
G.db = {
    executeSQL : function(sql) {
	db.transaction(function(tx) {
	    tx.executeSql(sql);
	});
    },
    reportePersonal : function(fi, ff) {
	db
		.transaction(function(tx) {
		    fi = fi + " 00:00:00";
		    ff = ff + " 23:59:59";
		    tx
			    .executeSql(
				    "select p.paterno||' '||p.materno||' '||p.nombre as nombre, p.documento as documento,h.fecha as fecha from historial h inner join personal p on h.personal=p.id where h.fecha between ? and ?",
				    [ fi, ff ], function(tx, results) {
					if (existeFuncion && existeFuncion.call)
					    existeFuncion.call(tx, results);
				    });
		});
    }
};

function reportePersonal() {

    var url = location.href;
    url = url.split("?");
    if (url.length <= 1) {
	return;
    }
    url = url[1].split("&");
    if (url.length <= 1) {
	return;
    }
    var fia = url[0].split("=");
    var ffa = url[1].split("=");
    if (fia.length <= 1 || ffa.length <= 1) {
	return;
    }
    var fi = fia[0] == "fechaInicial" ? fia[1] : false, ff = "fechaFinal" ? ffa[1] : false;
    fi = ffa[0] == "fechaInicial" ? ffa[1] : fi;
    ff = fia[0] == "fechaFinal" ? fia[1] : ff;
    if (fi && ff) {
	existeFuncion = function(r) {
	    var t = "";
	    if (r && r.rows && r.rows.length > 0) {
		t = "<table border='1' cellpadding='5' cellspacing='0'><thead><th>Nombre</th><th>Documento</th><th>Fecha</th></thead><tbody>";
		for ( var i = 0; i < r.rows.length; i++) {
		    var o = r.rows.item(i);
		    t += "<tr><td>" + o.nombre + "</td><td>" + o.documento + "</td><td>" + o.fecha + "</td></tr>";
		}
		t += "</tbody></table>";

	    } else {
		t = "No existe reporte.";
	    }
	    $("body").html(t);
	};
	G.db.reportePersonal(fi, ff);
    }
}

$(document).ready(function() {
    reportePersonal()
});