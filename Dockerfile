FROM ubuntu:latest
LABEL authors="abdel"

ENTRYPOINT ["top", "-b"]