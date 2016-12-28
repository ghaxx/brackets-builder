/**
 * @author Victor Hornets, 2015
 * @author Kuba Slawinski, 2015
 * @author Leandro Silva | Grafluxe, 2016
 */

/*global define, brackets, console, $ */

define(function (require, exports, module) { //jshint ignore:line
    "use strict";

    var menuId = "extensions.bsb.menu",

        AppInit             = brackets.getModule("utils/AppInit"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        Menus               = brackets.getModule("command/Menus"),
        NodeConnection      = brackets.getModule("utils/NodeConnection"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        WorkspaceManager    = brackets.getModule("view/WorkspaceManager"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        ProjectManager      = brackets.getModule("project/ProjectManager"),
        MainViewManager     = brackets.getModule("view/MainViewManager"),
        nodeConnection      = new NodeConnection(),
        domainPath          = ExtensionUtils.getModulePath(module) + "domain",

        curOpenDir,
        curOpenFile,
        curOpenFileName,
        curOpenLang,
        curOpenProj,

        builders = JSON.parse(require("text!builder.json")),
        panel,
        panelHTML = require("text!brackets-builder-panel.html");

    function baseName(str) {
       var base = str.substring(str.lastIndexOf("/") + 1);
        if(base.lastIndexOf(".") !== -1) {
            base = base.substring(0, base.lastIndexOf("."));
        }
       return base;
    }

    function parseCommand(command) {
        return command
                .replace(/\$PATH\/?/g, curOpenDir)
                .replace(/\$FULL_FILE\/?/g, curOpenFile)
                .replace(/\$BASE_FILE\/?/g, baseName(curOpenFileName))
                .replace(/\$FILE\/?/g, curOpenFileName)
                .replace(/\$PROJ_ROOT\/?/g, curOpenProj);
    }

    function processCmdOutput(data) {
        data = JSON.stringify(data);
        data = data
            .replace(/\\"/g, "\"")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\n/g, "\n")
            .replace(/\\n/g, "\n")
            .replace(/^"|"$/g, "");
        return data;
    }

    function securePath(path) {
        if (path.indexOf(" ") === -1) {
            return path;
        } else {
            return "\"" + path + "\"";
        }
    }

    function buildRuntimeStatus(start) {
        var duration = (new Date().getTime() - start.getTime()) / 1000;

        return "Finished in <b>" + duration + "</b>s";
    }

    function executeAction(action) {
        CommandManager.execute("file.saveAll");
        $("#builder-panel .builder-content").html("");

        curOpenDir      = securePath(DocumentManager.getCurrentDocument().file._parentPath);
        curOpenFile     = securePath(DocumentManager.getCurrentDocument().file._path);
        curOpenFileName = securePath(DocumentManager.getCurrentDocument().file._name);
        curOpenLang     = securePath(DocumentManager.getCurrentDocument().language._name);
        curOpenProj     = securePath(ProjectManager.getProjectRoot()._path);

        nodeConnection.connect(true).fail(function (err) {
            console.error("[[Brackets Builder]] Cannot connect to node: ", err);
        }).then(function () {
            console.log("Building " + curOpenLang + " in " + curOpenFile + "...\n");

            return nodeConnection.loadDomains([domainPath], true).fail(function (err) {
                console.error("[[Brackets Builder]] Cannot register domain: ", err);
            });
        }).then(function () {
            var cmd = null,
                foundLanguage = false,
                start;

            builders.forEach(function (el) {
                if (el.name.toLowerCase() === curOpenLang.toLowerCase()) {
                    foundLanguage = true;
                    cmd = el[action];
                }
            });

            if (cmd === null || foundLanguage === false) {
                if (foundLanguage) {
                    Dialogs.showModalDialog(
                        "",
                        "Brackets Builder Extention",
                        "It is very possible that this operation is not possible for current type of file."
                    );
                } else {
                    Dialogs.showModalDialog(
                        "",
                        "Brackets Builder Extention",
                        "No run configuration for current file type. Go to Edit > Script Builder Configuration and add one."
                    );
                }
            } else {
                cmd = parseCommand(cmd);
                start = new Date();
                $("#builder-panel .command .text").html(cmd);
                $("#builder-panel .command .status").html("Running...");
                panel.show();
                nodeConnection.domains["builder.execute"].exec(curOpenDir, cmd)
                .fail(function (err) {
                    $("#builder-panel .builder-content").html(processCmdOutput(err));
                })
                .then(function (data) {
                    $("#builder-panel .builder-content").html(processCmdOutput(data));
                    $("#builder-panel .command .status").html(buildRuntimeStatus(start));
                });
            }
        }).done();
    }

    function compile() {
        executeAction("compile");
    }

    function run() {
        executeAction("run");
    }

    function runCompiled() {
        executeAction("runCompiled");
    }

    AppInit.appReady(function () {
        var menu,
            src,
            $tack;

        panel = WorkspaceManager.createBottomPanel("brackets-builder-panel", $(panelHTML), 100);

        $("#builder-panel .close.real").on("click", function () {
            panel.hide();
        });

        $tack = $("#builder-panel .tack");

        $tack.on("click", function () {
            $tack.toggleClass("tack-on");
        });

        MainViewManager.on("currentFileChange", function () {
            if (!$tack.hasClass("tack-on")) {
                panel.hide();
            }
        });

        CommandManager.register("Run", "builder.run", run);
        CommandManager.register("Compile", "builder.compile", compile);
        CommandManager.register("Run Compiled", "builder.runCompiled", runCompiled);

        Menus.addMenu("Build", menuId, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);

        menu = Menus.getMenu(menuId);
        menu.addMenuItem("builder.run", "F9");
        menu.addMenuItem("builder.compile", "F10");
        menu.addMenuItem("builder.runCompiled", "shift-F10");

        // Add menu item to edit .json file
        menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

        menu.addMenuDivider();
        // Create menu item that opens the config .json-file
        CommandManager.register("Script Builder Configuration", "builder.open-conf", function () {
            Dialogs.showModalDialog("", "Brackets Builder Extention", "You must restart Brackets after changing this file.");
            src = FileUtils.getNativeModuleDirectoryPath(module) + "/builder.json";

            DocumentManager.getDocumentForPath(src).done(
                function (doc) {
                    DocumentManager.setCurrentDocument(doc);
                }
            );
        });

        menu.addMenuItem("builder.open-conf");

        // Load panel css
        ExtensionUtils.loadStyleSheet(module, "brackets-builder.css");
    });

});
