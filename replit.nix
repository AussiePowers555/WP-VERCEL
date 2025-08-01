{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.npm-check-updates
    pkgs.nodePackages.typescript-language-server
    pkgs.nodePackages.vscode-langservers-extracted
    pkgs.nodePackages.prettier
  ];
}