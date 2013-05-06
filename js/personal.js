var db = openDatabase("personalPanchita", "1.0",
		"Administracion de Personal en Panchita", 50 * 1024 * 1024);
var existeFuncion = false;
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
	}
};

$(document)
		.on(
				"ready",
				function() {
					G.db
							.executeSQL("create table if not exists personal(id integer not null primary key autoincrement,documento varchar(30) not null,paterno varchar(200) not null,materno varchar(200) null, nombre varchar(200) null)");
					G.db
							.executeSQL("create table if not exists historial(id integer not null primary key autoincrement,personal integer not null,fecha datetime not null  DEFAULT current_timestamp)");
				});

function administrar() {
	$("#tickearPersonal").fadeOut("slow", function() {
		$("#editarPersonal").fadeIn("slow");
	});
	$("#admPersonal input[name='administrar']").hide();
	$("#admPersonal input[name='tickear']").show();
}
function tickear() {
	$("#editarPersonal").fadeOut("slow", function() {
		$("#tickearPersonal").fadeIn("slow");
	});

	$("#admPersonal input[name='tickear']").hide();
	$("#admPersonal input[name='administrar']").show();
}

function tickearPersonal() {
	var f = this;
	var d = $(this.documento).val();
	existeFuncion = function(r) {
		if (r && r.rows && r.rows.length > 0) {
			var o = r.rows.item(0);
			var id = o.id;
			G.db.insertarHistorial(id);
			f.reset();
		} else {
			f.reset();
			msgForm("No se pudo encontrar al personal con documento: " + d
					+ ".");
		}
	};
	G.db.existePersonal(d);
	return false;
}

function msgForm(msg) {
	$("#errorFormPersonal").fadeIn("slow").html(msg);
	setTimeout('$("#errorFormPersonal").fadeOut("slow")', 5000);
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