FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ResolveDesk.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish ResolveDesk.csproj --configuration Release --output /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

RUN groupadd --gid 10001 rahel \
    && useradd --uid 10001 --gid rahel --home-dir /app --shell /usr/sbin/nologin rahel \
    && chown -R rahel:rahel /app

COPY --from=build --chown=rahel:rahel /app/publish ./

USER rahel

ENV ASPNETCORE_URLS=http://+:5051

EXPOSE 5051

ENTRYPOINT [ "dotnet", "ResolveDesk.dll" ]
