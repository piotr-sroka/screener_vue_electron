<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="shortcut icon" href="app_logo.ico" type="image/x-icon">
		<title>Screener - Download</title>
		<style>
			html,
			body {
				margin: 0;
				padding: 0;
				width: 100%;
				height: 100%;
				background-color: #009688;
			}
			body {
				display: flex;
				align-items: center;
				justify-content: center;
			}
			img {
				max-width: 300px;
				max-height: 300px;
				width: 100%;
				height: 100%;
				padding: 50px;
                transition: all .2s linear;
			}
            img:hover {
                margin-top: 20px;
            }
		</style>
	</head>
	<body>
		<?php
			$actualVersionName = '';
			if ($handle = opendir('./actual/')) {
				while (false !== ($entry = readdir($handle))) {
					if ($entry != "." && $entry != "..") {
						$actualVersionName = $entry;
					}
				}
				closedir($handle);
			}
		?>
		<a href="./actual/<?php echo($actualVersionName) ?>" target="_blank">
			<img src="download-icon.svg" alt="" />
		</a>
	</body>
</html>
