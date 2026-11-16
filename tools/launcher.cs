// Fluent Path - lançador. Compilado por tools\build-exe.bat com o csc.exe que já vem no Windows.
// Faz o mesmo que "Abrir Fluent Path.bat": sobe tools\server.ps1 escondido (que abre a janela do app).
// Se o servidor já estiver rodando, só abre uma janela do app nele.
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Windows.Forms;

static class Launcher
{
    static string Root = AppDomain.CurrentDomain.BaseDirectory;

    [STAThread]
    static void Main()
    {
        string script = Path.Combine(Root, "tools", "server.ps1");
        if (!File.Exists(script) || !File.Exists(Path.Combine(Root, "app", "index.html")))
        {
            MessageBox.Show("Não encontrei as pastas 'tools' e 'app' ao lado do FluentPath.exe.\nMantenha o .exe dentro da pasta do Fluent Path (pode criar um atalho dele onde quiser).", "Fluent Path", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        int port = RunningPort();
        if (port > 0) { OpenWindow("http://localhost:" + port + "/"); return; }
        var psi = new ProcessStartInfo("powershell.exe", "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + script + "\"");
        psi.WorkingDirectory = Root; psi.UseShellExecute = false; psi.CreateNoWindow = true;
        try { Process.Start(psi); }
        catch (Exception e) { MessageBox.Show("Não consegui iniciar o Fluent Path:\n" + e.Message, "Fluent Path", MessageBoxButtons.OK, MessageBoxIcon.Error); }
    }

    // verifica apenas se o processo do servidor registrado em data\server.pid ainda está vivo (instantâneo, sem varrer 20 portas)
    static int RunningPort()
    {
        try
        {
            string data = Path.Combine(Root, "data");
            string pidFile = Path.Combine(data, "server.pid");
            if (!File.Exists(pidFile)) return 0;
            int pid;
            if (!int.TryParse(File.ReadAllText(pidFile).Trim(), out pid)) return 0;
            try { Process.GetProcessById(pid); } catch { return 0; }
            int port = 8765;
            string portFile = Path.Combine(data, "server.port");
            if (File.Exists(portFile)) int.TryParse(File.ReadAllText(portFile).Trim(), out port);
            var rq = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + port + "/api/ping");
            rq.Timeout = 200; rq.Headers.Add("X-FluentPath", "1");
            using (var rs = (HttpWebResponse)rq.GetResponse()) if ((int)rs.StatusCode == 200) return port;
        }
        catch { }
        return 0;
    }

    static void OpenWindow(string url)
    {
        string[] c = {
            Environment.GetEnvironmentVariable("ProgramFiles(x86)") + @"\Microsoft\Edge\Application\msedge.exe",
            Environment.GetEnvironmentVariable("ProgramFiles") + @"\Microsoft\Edge\Application\msedge.exe",
            Environment.GetEnvironmentVariable("ProgramFiles") + @"\Google\Chrome\Application\chrome.exe",
            Environment.GetEnvironmentVariable("ProgramFiles(x86)") + @"\Google\Chrome\Application\chrome.exe" };
        string prof = Path.Combine(Root, "runtime", "browser-profile"); Directory.CreateDirectory(prof);
        foreach (var exe in c)
            if (File.Exists(exe)) { Process.Start(exe, "--app=" + url + " --user-data-dir=\"" + prof + "\" --no-first-run --no-default-browser-check --window-size=1280,860"); return; }
        Process.Start(url);
    }
}
