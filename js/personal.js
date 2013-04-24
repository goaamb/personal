var db = openDatabase("personalPanchita", "1.0",
		"Administracion de Personal en Panchita", 50 * 1024 * 1024);

G.db = {
	executeSQL : function(sql) {
		db.transaction(function(tx) {
			tx.executeSql(sql);
		});
	}
}

$(document)
		.on(
				"ready",
				function() {
					G.db
							.executeSQL("create table if not exists personal(id integer not null primary key autoincrement,paterno varchar(200) not null,materno varchar(200) null, nombre varchar(200) null)");
					G.db
							.executeSQL("create table if not exists historial(id integer not null primary key autoincrement,personal integer not null,fecha datetime not null  DEFAULT current_timestamp)");
				});