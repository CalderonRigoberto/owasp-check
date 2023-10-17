const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');

// Abre en el explorador de archivos de acuerdo a la plataforma y al path que se le haya proveido
function openFolderOrFile() {
	const platform = process.platform;
	const openCommand = platform === 'win32' ? 'explorer' : platform === 'darwin' ? 'open' : 'xdg-open';
	exec(`${openCommand} "C:\\report"`);
}

// Revisa si ya esta instalado dependency-check en tu ruta 	C:\
function isDependencyCheckInstalled() {
	const dependencyCheckPath = 'C:\\dependency-check';
	return fs.existsSync(dependencyCheckPath);
}


// Descarga y coloca dependency-check en tu ruta C:\ para acceder facilmente
async function downloadAndInstallDependencyCheck() {
	if (!isDependencyCheckInstalled()) {
		const dependencyCheckUrl = 'https://github.com/jeremylong/DependencyCheck/releases/download/v8.4.0/dependency-check-8.4.0-release.zip';
		const destinationPath = 'C:\\dependency-check';


		const downloadCommand = `curl -L ${dependencyCheckUrl} -o dependency-check.zip`;
		exec(downloadCommand, (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage(`Error al intentar descargar dependency-check ${error} ${stderr}`);
				return;
			}
			vscode.window.showInformationMessage(`Se descomprimirá dependency-check ${stdout}`);

			// Descomprimir el archivo ZIP en C:\
			const unzipCommand = `Expand-Archive -Path 'dependency-check.zip' -DestinationPath '${destinationPath}' -Force`;
			exec(unzipCommand, (error, stdout, stderr) => {
				if (error) {
					console.error(`Error al descomprimir dependency-check: ${error} ${stderr}`);
					return;
				}
				vscode.window.showInformationMessage(`dependency-check ha sido descargado e instalado correctamente ${stdout}`);
			});

		});
	}
}

function getAnalyzeComand(projectPath) {
	const dependencyCheckPath = 'C:\\dependency-check';
	return `"${dependencyCheckPath}\\bin\\dependency-check.bat" --out C:\\report --scan "${projectPath}"`;
}

function activate(context) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('owas-check.analyzeme', async function () {

		await downloadAndInstallDependencyCheck();
		vscode.window.showInformationMessage('Análisis del proyecto iniciado... ');

		// Obtiene el path actual del proyecto donde se ejecuta el comando
		const projectPath = vscode.workspace.rootPath;
		if (!projectPath) {
			vscode.window.showWarningMessage('Abre un proyecto antes de iniciar el análisis.');
			return;
		}


		// Ejecuta "dependency-check" en la ubicación del proyecto
		exec(getAnalyzeComand(projectPath), (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage(`Error en el análisis del proyecto: ${error} ${stderr}`);
				return;
			}

			vscode.window.showInformationMessage(`Análisis del proyecto completado`, 'Abrir Carpeta').then((selection) => {
				if (selection === 'Abrir Carpeta') {
					openFolderOrFile();
				}
			});
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
