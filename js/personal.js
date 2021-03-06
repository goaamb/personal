var db = openDatabase("personalPanchita", "1.0",
		"Administracion de Personal en Panchita", 50 * 1024 * 1024);
var existeFuncion = false;
G.variables = {};
G.db = {
	executeSQL : function(sql) {
		db.transaction(function(tx) {
			tx.executeSql(sql);
		});
	},
	insertarPersonal : function(d, p, m, n) {
		db
				.transaction(function(tx) {
					tx
							.executeSql(
									"insert into personal(documento,paterno,materno,nombre) values(?,?,?,?)",
									[ d, p, m, n ]);
				});
	},
	insertarHistorial : function(p) {
		db.transaction(function(tx) {
			tx.executeSql("insert into historial(personal) values(?)", [ p ]);
		});
	},
	modificarPersonal : function(d, p, m, n, i) {
		db
				.transaction(function(tx) {
					tx
							.executeSql(
									"update personal set documento=?,paterno=?,materno=?,nombre=? where id=?",
									[ d, p, m, n, i ]);
				});
	},
	existePersonal : function(d) {
		db.transaction(function(tx) {
			tx.executeSql("select * from personal where documento=?", [ d ],
					function(tx, results) {
						if (existeFuncion && existeFuncion.call)
							existeFuncion.call(tx, results);
					});
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
									[ fi, ff ],
									function(tx, results) {
										if (existeFuncion && existeFuncion.call)
											existeFuncion.call(tx, results);
									});
				});
	}
};
$(document).bind("mobileinit", function(event) {
	$.extend($.mobile.zoom, {
		locked : true,
		enabled : false
	});
	init();
});
$(document).on("ready", function() {
	init();
});

function init() {

	G.db
			.executeSQL("create table if not exists personal(id integer not null primary key autoincrement,documento varchar(30) not null,paterno varchar(200) not null,materno varchar(200) null, nombre varchar(200) null)");
	G.db
			.executeSQL("create table if not exists historial(id integer not null primary key autoincrement,personal integer not null,fecha datetime not null  DEFAULT (datetime('now','localtime')))");
	$("#tecladoTickear a").on("tap", function() {
		tickearB.call(this);
	});
	$("a[href='#editarPersonal']").on("tap", function(e) {
		var d = $("#editarPersonal a[href='#editarPersonal']");
		if (d != $(this)) {
			e.preventDefault();
			setTimeout("disableNavEditarPersonal()", 500);
		}
		// administrar();
	});
}
function disableNavEditarPersonal() {
	$(".ui-navbar a").removeClass("ui-btn-active");
	$("#tickearPersonal a[href='#tickearPersonal']").addClass("ui-btn-active");
	$("#reportePersonal a[href='#reportePersonal']").addClass("ui-btn-active");
}

function administrar() {
	var x = prompt("Ingrese el Codigo: ");
	if (x == "1V4NK4") {
		// mostrar nueva pagina
	}
}
function tickear() {
	$("#editarPersonal").fadeOut("slow", function() {
		$("#tickearPersonal").fadeIn("slow");
	});
	$("#reportePersonal").fadeOut("slow", function() {
		$("#tickearPersonal").fadeIn("slow");
	});

	$("#admPersonal input[name='tickear']").hide();
	$("#admPersonal input[name='administrar']").show();
}

function tickearB() {
	var v = "" + $(this).data("value");
	var d = $("#tickearPersonal form input[name='documento']");

	switch (v) {
	case "C":
		var dd = d.val();
		d.val(dd.substring(0, dd.length - 1));
		break;
	case "T":
		tickearPersonal.call($("#tickearPersonal form"));
		break;
	default:
		var vv = d.val();
		d.val(vv + v);
		break;
	}
	return false;
}

function tickearPersonal() {
	var f = $(this);
	var d = $(this).find("input[name='documento']").val();
	existeFuncion = function(r) {
		if (r && r.rows && r.rows.length > 0) {
			var o = r.rows.item(0);
			var id = o.id;
			G.db.insertarHistorial(id);
			f.trigger("reset");
			msgFormTickear("El usuario: " + o.paterno + " " + o.materno + " "
					+ o.nombre + ", ingresó/salió con exito.");
		} else {
			f.trigger("reset");
			msgFormTickear("No se pudo encontrar al personal con documento: "
					+ d + ".");
		}
	};
	G.db.existePersonal(d);
	return false;
}

function msgForm(msg) {
	$("#errorFormPersonal").fadeIn("slow").html(msg);
	setTimeout('$("#errorFormPersonal").fadeOut("slow")', 5000);
}

function msgFormTickear(msg) {
	$("#errorFormTickear").fadeIn("slow").html(msg);
	setTimeout('$("#errorFormTickear").fadeOut("slow")', 5000);
}
function limpiar() {
	this.reset();
	this.id.value = "";
	msgForm("");
}
function procesarPersonal() {
	var i = $(this.id).val();
	var d = $(this.documento).val();
	var p = $(this.paterno).val();
	var m = $(this.materno).val();
	var n = $(this.nombre).val();

	if (d && p && n) {
		try {
			if (i) {
				G.db.modificarPersonal(d, p, m, n, i);
				this.reset();
				msgForm("Se modifico con exito.");
			} else {
				var f = this;
				existeFuncion = function(r) {
					if (!r || (r && r.rows && r.rows.length == 0)) {
						G.db.insertarPersonal(d, p, m, n);
						f.reset();
						msgForm("Se ingreso con exito.");
					} else {
						msgForm("El documento ya existe en el sistema.");
					}
				};
				G.db.existePersonal(d);
			}
		} catch (e) {
			console.log(e);
		}
	} else {
		msgForm("Los campos con * son obligatorios.");
	}
	return false;
}

function buscarPersonal() {
	var d = prompt("Ingrese un Documento para Buscar en el Personal", "0");
	if (d) {
		var f = this;
		existeFuncion = function(r) {
			if (r && r.rows && r.rows.length > 0) {
				var o = r.rows.item(0);
				$(f.id).val(o.id);
				$(f.documento).val(o.documento);
				$(f.paterno).val(o.paterno);
				$(f.materno).val(o.materno);
				$(f.nombre).val(o.nombre);
			} else {
				f.reset();
				msgForm("No se pudo encontrar al personal con documento: " + d
						+ ".");
			}
		};
		G.db.existePersonal(d);
	}
}

function reportePersonal() {
	$("#editarPersonal").fadeOut("slow", function() {
		$("#reportePersonal").fadeIn("slow");
	});
	$("#tickearPersonal").fadeOut("slow", function() {
		$("#reportePersonal").fadeIn("slow");
	});
}

function subirReporte() {
	var t = $(this);
	var fi = t.find("input[name='fechaInicial']").val();
	var ff = t.find("input[name='fechaFinal']").val();
	existeFuncion = function(r) {
		var t = [];
		if (r && r.rows && r.rows.length > 0) {
			for ( var i = 0; i < r.rows.length; i++) {
				t.push(r.rows.item(i));
			}
		}
	};
	G.db.reportePersonal(fi, ff);
}