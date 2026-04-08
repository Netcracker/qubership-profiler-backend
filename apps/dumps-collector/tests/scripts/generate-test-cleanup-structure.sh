#!/bin/ash

MINUTES_COUNT=$1
NAMESPACES_COUNT=$2
SERVICES_COUNT=$3
DIAG_FILES_COUNT=$4

# The default 10000 is about 166 hours or 6 days
if [ -z "${MINUTES_COUNT}" ] ; then
  MINUTES_COUNT=10000
fi
if [ -z "${NAMESPACES_COUNT}" ] ; then
  NAMESPACES_COUNT=1
fi
if [ -z "${SERVICES_COUNT}" ] ; then
  SERVICES_COUNT=1
fi
if [ -z "${DIAG_FILES_COUNT}" ] ; then
  DIAG_FILES_COUNT=1
fi

echo "Start generating test data for ${MINUTES_COUNT} minutes, ${NAMESPACES_COUNT} namespaces, ${SERVICES_COUNT} services and ${DIAG_FILES_COUNT} files"

for shift in $(seq 1 $MINUTES_COUNT) ;do
  shiftHour=$( expr "${shift}" % 60 )
  if [[ "${shiftHour}" == 0 ]] ; then
    echo "Processing hour $( expr "${shift}" / 60 ) out of $( expr 10000 / 60 )"
  fi
  formattedDate="$(date --date="${shift} minute ago" +"%Y/%m/%d/%H/%M/%S")"
  for namespace in $(seq 1 $NAMESPACES_COUNT) ; do
    for service in $(seq 1 $SERVICES_COUNT) ; do
      for diagfile in $(seq 1 $DIAG_FILES_COUNT) ; do
        thePrefix="${DIAG_PV_MOUNT_PATH}/diagnostic/ns${namespace}/${formattedDate}/service${service}"
        mkdir -p "${thePrefix}"
        echo "Some file content of namespace ${namespace} service ${service} diagfile ${diagfile} ${shift} minutes ago" > "${thePrefix}/diagfile${diagfile}.lst"
      done
    done
  done
done
echo "Done"
