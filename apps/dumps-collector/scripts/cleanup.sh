#!/bin/ash

# Allow to run cleanup in dry-run. To do it need specify
# ./cleanup.sh dry-run
dryRun=$1

sleepTimeout="1800"

hoursToArchiveAfter=${DIAG_PV_HOURS_ARCHIVE_AFTER:-2}
hoursToStopArchivingAfter=$((hoursToArchiveAfter + 3))
daysToDeleteAfter=${DIAG_PV_DAYS_DELETE_AFTER:-14}

log() {
  echo "[$(date +%FT%T%Z)][INFO][class=cleanup.sh] $1"
}

if [ -z "$DIAG_PV_MOUNT_PATH" ] ; then
  log "Diagnostic volume is not mounted. Cleanup is disabled"
  exit 0;
fi

while :
do
  prefixToArchiveAfter=$(TZ=UTC date --date="${hoursToArchiveAfter} hour ago" +"%Y/%m/%d/%H/%M/%S")
  prefixToStopArchivingAfter=$(TZ=UTC date --date="${hoursToStopArchivingAfter} hour ago" +"%Y/%m/%d/%H/%M/%S")
  prefixToDeleteAfter=$(TZ=UTC date --date="${daysToDeleteAfter} day ago" +"%Y/%m/%d/%H/%M/%S")

  log "Hours to archive after: ${hoursToArchiveAfter} hours, directories prefix: ${prefixToArchiveAfter}"
  log "Hours to stop archiving after: ${hoursToStopArchivingAfter} hours, directories prefix: ${prefixToStopArchivingAfter}"
  log "Days to delete after: ${daysToDeleteAfter} days, directories prefix: ${prefixToDeleteAfter}"

  # change directory so that archive will always be packed starting from the namespace
  cd "${DIAG_PV_MOUNT_PATH}/diagnostic" || ( log "Failed to cd into ${DIAG_PV_MOUNT_PATH}/diagnostic. Sleep on ${sleepTimeout} seconds." && sleep "${sleepTimeout}" )

  # Iterate by files in ${DIAG_PV_MOUNT_PATH}/diagnostic and remove or archive old files
  # Structure inside the directory is:
  #   <namespace_name>/<year>/<month>/<day>/<hour>/<minute>/<second>/<service_name>/<file_name>.<extension>
  # for example:
  #   profiler/2023/03/03/13/10/25/esc-collector-service/td.zip
  # where:
  # * namespace - profiler
  # * date - 03.03.2023
  # * time - 13:10:25
  # * service - esc-collector-service
  # * file - td.zip
  for namespace in ./* ; do
    if [ ! -d "${namespace}" ] ; then
      log "${namespace} is not a directory. Skipping it. If you see './*' it usually means that the directory ${DIAG_PV_MOUNT_PATH}/diagnostic' currently has no data from applications."
      continue
    fi

    archiveAfterWithNamespace="${namespace}/${prefixToArchiveAfter}"
    stopArchivingAfterWithNamespace="${namespace}/${prefixToStopArchivingAfter}"
    deleteAfterWithNamespace="${namespace}/${prefixToDeleteAfter}"

    log "Processing ${namespace} directory"
    log "Archiving from ${stopArchivingAfterWithNamespace} to ${archiveAfterWithNamespace}"
    log "Deleting before ${deleteAfterWithNamespace}"

    (
      # Lock namespace
      flock -n 200 || log "Namespace ${namespace} is already being cleaned up"

      # Run cleanup
      /scripts/cleanup-namespace.sh \
        "${namespace}"\
        "${archiveAfterWithNamespace}" \
        "${stopArchivingAfterWithNamespace}" \
        "${deleteAfterWithNamespace}" \
        "${dryRun}"
    ) 200>"${namespace}/cleanup.lock"

    # Remove lock
    rm -rf "${namespace}/cleanup.lock"

  done

  log "Sleep on ${sleepTimeout} seconds"
  sleep "${sleepTimeout}"
done
