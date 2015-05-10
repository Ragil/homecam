#!/bin/bash
set -e

cd frontend;
npm run clean;
npm run test;
npm run build;

cd ..
