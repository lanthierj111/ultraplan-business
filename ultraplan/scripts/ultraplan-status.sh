#!/usr/bin/env bash
# ultraplan-status.sh — Affiche l'état de la boucle courante
export HERMES_HOME=\C:\Users\jacob/AppData/Local/hermes
echo \"=== Hermes Status ===\"
hermes status
echo \"\n=== Loop Status ===\"
ls -la C:/Business/ultraplan/loops/
echo \"\n=== Projects ===\"
ls -la C:/Business/ultraplan/projects/
