#!/bin/bash
# Arrow key menu picker with scrolling and recent selection memory
# Usage: source picker.sh
#   pick "Title" options_array                    # no memory
#   pick "Title" options_array --key "cache-key"  # remembers last pick

PICKER_CACHE_DIR="${HOME}/.cache/nxrn-picker"

pick() {
  local title="$1"
  shift

  # Parse options and --key flag
  local raw_options=()
  local cache_key=""
  while [ $# -gt 0 ]; do
    if [ "$1" = "--key" ]; then
      cache_key="$2"
      shift 2
    else
      raw_options+=("$1")
      shift
    fi
  done

  local options=("${raw_options[@]}")
  local count=${#options[@]}
  local selected=0

  # If cache key provided, sort last-used to top
  local reordered_indices=()
  if [ -n "$cache_key" ] && [ -f "$PICKER_CACHE_DIR/$cache_key" ]; then
    local last_pick
    last_pick=$(cat "$PICKER_CACHE_DIR/$cache_key")

    # Find the last-used item and move it to front
    local found_idx=-1
    for i in "${!options[@]}"; do
      if [ "${options[$i]}" = "$last_pick" ]; then
        found_idx=$i
        break
      fi
    done

    if [ $found_idx -ge 0 ]; then
      local new_options=("${options[$found_idx]}")
      reordered_indices=($found_idx)
      for i in "${!options[@]}"; do
        if [ "$i" -ne $found_idx ]; then
          new_options+=("${options[$i]}")
          reordered_indices+=($i)
        fi
      done
      options=("${new_options[@]}")
    fi
  fi

  # If no reorder happened, build identity mapping
  if [ ${#reordered_indices[@]} -eq 0 ]; then
    for i in "${!options[@]}"; do
      reordered_indices+=($i)
    done
  fi

  # Max visible rows
  local term_height=$(tput lines)
  local max_visible=$((term_height - 4))
  if [ $max_visible -gt $count ]; then
    max_visible=$count
  fi
  if [ $max_visible -lt 3 ]; then
    max_visible=3
  fi

  local scroll_offset=0

  tput civis
  trap 'tput cnorm' RETURN

  draw_menu() {
    for ((i = 0; i < max_visible; i++)); do
      local idx=$((scroll_offset + i))
      tput el
      if [ "$idx" -eq $selected ]; then
        echo -e "  \033[7m> ${options[$idx]}\033[0m"
      else
        echo "    ${options[$idx]}"
      fi
    done
    tput el
    if [ $count -gt $max_visible ]; then
      echo -e "  \033[2m[$((selected + 1))/$count]\033[0m"
    else
      echo ""
    fi
  }

  echo ""
  echo "$title"
  draw_menu

  local visible_lines=$((max_visible + 1))

  while true; do
    IFS= read -rsn1 key

    if [[ "$key" == $'\x1b' ]]; then
      read -rsn2 rest
      key+="$rest"
    fi

    case "$key" in
      $'\x1b[A' | k)
        ((selected--))
        if [ $selected -lt 0 ]; then
          selected=$((count - 1))
          scroll_offset=$((count - max_visible))
          if [ $scroll_offset -lt 0 ]; then scroll_offset=0; fi
        elif [ $selected -lt $scroll_offset ]; then
          scroll_offset=$selected
        fi
        ;;
      $'\x1b[B' | j)
        ((selected++))
        if [ $selected -ge $count ]; then
          selected=0
          scroll_offset=0
        elif [ $selected -ge $((scroll_offset + max_visible)) ]; then
          scroll_offset=$((selected - max_visible + 1))
        fi
        ;;
      '')
        break
        ;;
    esac

    tput cuu $visible_lines
    draw_menu
  done

  tput cnorm

  # Save selection to cache
  if [ -n "$cache_key" ]; then
    mkdir -p "$PICKER_CACHE_DIR"
    echo "${options[$selected]}" > "$PICKER_CACHE_DIR/$cache_key"
  fi

  # Map back to original index
  PICKED_INDEX=${reordered_indices[$selected]}
}
