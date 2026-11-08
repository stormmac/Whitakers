"""Build an artifact-safe preview in preview/: CSS and JS inlined (the claude.ai
preview blocks separate style/script files). The homepage drops its own
<html>/<head>/<body> wrapper because the preview host adds one."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
out = root / "preview"; out.mkdir(exist_ok=True)
css = (root / "assets/styles.css").read_text()
js = (root / "assets/main.js").read_text().replace("</script", "<\\/script")
import base64
def inline_images(html):
    def data(m):
        f = root / m.group(1)
        return 'src="data:image/webp;base64,' + base64.b64encode(f.read_bytes()).decode() + '"'
    return re.sub(r'src="(assets/designs/[^"]+\.webp)"', data, html)
def inline(html):
    html = inline_images(html)
    html = html.replace('<link rel="stylesheet" href="assets/styles.css">', "<style>\n" + css + "\n</style>")
    html = html.replace('<script src="assets/main.js"></script>', "<script>\n" + js + "\n</script>")
    assert "assets/styles.css" not in html and "assets/main.js" not in html
    return html
for name in ["index.html", "contact.html", "custom-design.html"]:
    html = inline((root / name).read_text())
    if name == "index.html":
        title = re.search(r"<title>.*?</title>", html).group(0)
        head = re.search(r"<head>(.*?)</head>", html, re.S).group(1).replace(title, "")
        head = re.sub(r'<meta (charset|name="viewport")[^>]*>\s*', "", head)
        body = re.search(r"<body[^>]*>(.*)</body>", html, re.S).group(1)
        html = title + "\n" + head.strip() + "\n" + body.strip() + "\n"
    (out / name).write_text(html)
    print(name, len(html))
