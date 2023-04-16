from subprocess import Popen


def main():
    exit(
        Popen(
            [
                "python",
                "-m",
                "pip",
                "-t",
                "./bundled/libs",
                "--no-cache-dir",
                "--implementation",
                "py",
                "--no-deps",
                "--upgrade",
                "-r",
                "./requirements.txt",
            ],
        ).wait()
    )


if __name__ == "__main__":
    main()
