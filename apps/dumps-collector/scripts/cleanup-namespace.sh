#!/bin/ash

the_namespace="$1"
archiveAfterWithNamespace="$2"
stopArchivingAfterWithNamespace="$3"
deleteAfterWithNamespace="$4"
dryRun=$5

log() {
  echo "[$(date +%FT%T%Z)][INFO][class=cleanup-namespace.sh] $1"
}

notDryRun() {
  if [ "${dryRun}" == "dry-run" ] ; then
    return 1
  else
    return 0
  fi
}

shouldDelete() {
  file=$1
  deleteThreshold=$2

  # If it either NOT exist or NOT a directory, so return from function and return exit code 1 (Error)
  if [ ! -d "${file}" ] ; then
    return 1
  fi

  # Truncate threshold to same path depth (component count) as file, then compare.
  # Character-based truncation was wrong: e.g. ./ns/2026/02 vs first-30-chars of
  # ./ns/2026/02/22/10/43/23 gives ./ns/2026/02/22, so "02" < "22" and we'd delete whole month.
  numComp=1
  tmp="${file}"
  while [ -n "${tmp}" ] ; do
    case "${tmp}" in */*) numComp=$(( numComp + 1 )); tmp="${tmp#*/}";; *) tmp="";; esac
  done
  thresholdAtSameDepth=$(echo "${deleteThreshold}" | cut -d'/' -f1-"${numComp}")

  # Delete only if path is strictly before threshold at this depth
  if [ "${file}" \< "${thresholdAtSameDepth}" ] ; then
    return 0
  fi
  log "Do not delete ${file} because it upper than ${thresholdAtSameDepth}"
  return 1
}

shouldArchive() {
  file=$1
  prefixLen=${#file}
  upperPrefix="$( echo "$2" | cut -c1-"${prefixLen}")"
  lowerPrefix="$( echo "$3" | cut -c1-"${prefixLen}")"

  if [ ! -d "${file}" ] ; then
    log "Do not archive ${file} because it is not a directory"
    return 1
  fi

  if [ "${file}" \< "${upperPrefix}" ] || [ "${file}" = "${upperPrefix}" ] ; then
    if [ "${file}" \> "${lowerPrefix}" ] || [ "${file}" = "${lowerPrefix}" ] ; then
      return 0
    else
      log "Do not archive ${file} because it is lower than ${lowerPrefix}"
      return 1
    fi
  fi
  log "Do not archive ${file} because it is upper than ${upperPrefix}"
  return 1
}

# Returns 0 only when path was deleted (caller should skip children).
# Returns 1 when path was not deleted (caller must descend into children to delete/archive).
doNotArchive() {
  if shouldDelete "$1" "$4" ; then
    log "Deleting       $1"
    if notDryRun ; then
      rm -rf "$1" || log "Failed to delete $1 (exit code $?)"
    fi
    return 0
  fi
  if shouldArchive "$1" "$2" "$3" ; then
    return 1
  fi
  # Keep zone: not deleted, not in archive window; must descend to check children (e.g. 02/13 under 02)
  return 1
}

performCleanup() {
  namespace="$1"
  log "Starting cleanup and archiving of ${namespace}"
  for year in "${namespace}"/* ; do
    # Skip cleanup.lock file
    if [[ "${year}" == *".lock"* ]] ; then
      continue
    fi

    if doNotArchive "${year}" "${archiveAfterWithNamespace}" "${stopArchivingAfterWithNamespace}" "${deleteAfterWithNamespace}" ; then
      continue
    fi
    for month in "${year}"/* ; do
      if doNotArchive "${month}" "${archiveAfterWithNamespace}" "${stopArchivingAfterWithNamespace}" "${deleteAfterWithNamespace}" ; then
        continue
      fi
      for day in "${month}"/* ; do
        if doNotArchive "${day}" "${archiveAfterWithNamespace}" "${stopArchivingAfterWithNamespace}" "${deleteAfterWithNamespace}" ; then
          continue
        fi
        for hour in "${day}"/* ; do
          if doNotArchive "${hour}" "${archiveAfterWithNamespace}" "${stopArchivingAfterWithNamespace}" "${deleteAfterWithNamespace}" ; then
            continue
          fi
          log "Archiving hour ${hour} to ${hour}.zip"
          if notDryRun ; then
            zip -rqu "${hour}.zip" "${hour}"
            rm -rf "${hour}"
          fi
        done
      done
    done
  done
}

performCleanup "${the_namespace}"
