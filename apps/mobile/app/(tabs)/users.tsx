import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUsers } from '../../src/hooks/queries/useUsers';
import { useZones } from '../../src/hooks/queries/useZones';
import { StatusIndicator } from '../../src/components/ui/StatusIndicator';
import { Badge } from '../../src/components/ui/Badge';
import { Modal } from '../../src/components/ui/Modal';
import { Card } from '../../src/components/ui/Card';
import { SegmentedControl } from '../../src/components/ui/SegmentedControl';
import { ChipSelect } from '../../src/components/ui/ChipSelect';
import { colors } from '../../src/utils/colors';
import { haptic } from '../../src/utils/haptics';

type GroupBy = 'none' | 'zone' | 'status';

export default function UsersScreen() {
  const [search, setSearch] = useState('');
  const [filterAffiliation, setFilterAffiliation] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filters: Record<string, string> = {};
  if (search) filters.search = search;
  if (filterAffiliation) filters.affiliation = filterAffiliation;
  if (filterStatus) filters.status = filterStatus;

  const { data: users, refetch, isRefetching } = useUsers(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  const { data: zones } = useZones();

  const getZoneName = useCallback(
    (zoneId: string) => zones?.find((z: any) => z.id === zoneId)?.name || 'Unassigned',
    [zones]
  );

  const groupedData = useMemo(() => {
    if (!users) return [];
    if (groupBy === 'none') return users;

    const groups: Record<string, any[]> = {};
    users.forEach((user: any) => {
      const key =
        groupBy === 'zone'
          ? user.zoneId || 'unassigned'
          : user.responseStatus || 'no_reply';
      if (!groups[key]) groups[key] = [];
      groups[key].push(user);
    });

    return Object.entries(groups).map(([key, items]) => ({
      groupKey: key,
      groupLabel:
        groupBy === 'zone'
          ? getZoneName(key)
          : key.replace('_', ' ').toUpperCase(),
      items,
      count: items.length,
    }));
  }, [users, groupBy, getZoneName]);

  const renderUser = useCallback(
    (user: any) => (
      <Pressable
        key={user.id}
        onPress={() => {
          haptic.selection();
          setSelectedUser(user);
        }}
        style={({ pressed }) => [
          styles.userRow,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.userSubRow}>
            <Text style={styles.userBadge}>{user.badgeNumber}</Text>
            <Text style={styles.userDot}>-</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        </View>
        <View style={styles.userMeta}>
          <StatusIndicator status={user.responseStatus} size="small" />
          <Badge
            text={user.affiliation}
            variant={user.affiliation === 'aramco' ? 'info' : 'default'}
            size="small"
          />
        </View>
      </Pressable>
    ),
    []
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or badge..."
          placeholderTextColor={colors.gray[400]}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {search.length > 0 && Platform.OS === 'android' && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <ChipSelect
          chips={[
            { value: '', label: 'All' },
            { value: 'aramco', label: 'Aramco' },
            { value: 'contractor', label: 'Contractor' },
          ]}
          selected={filterAffiliation}
          onChange={(v) => setFilterAffiliation(v === filterAffiliation ? '' : v)}
          scrollable
        />
      </View>

      <View style={styles.filterSection}>
        <ChipSelect
          chips={[
            { value: '', label: 'All Status' },
            { value: 'safe', label: 'Safe', color: colors.status.safe },
            { value: 'pending', label: 'Pending', color: colors.status.pending },
            { value: 'need_help', label: 'Need Help', color: colors.status.need_help },
            { value: 'no_reply', label: 'No Reply', color: colors.status.no_reply },
          ]}
          selected={filterStatus}
          onChange={(v) => setFilterStatus(v === filterStatus ? '' : v)}
          scrollable
        />
      </View>

      {/* Group By */}
      <View style={styles.groupControl}>
        <SegmentedControl
          options={[
            { value: 'none', label: 'List' },
            { value: 'zone', label: 'By Zone' },
            { value: 'status', label: 'By Status' },
          ]}
          value={groupBy}
          onChange={(v) => setGroupBy(v as GroupBy)}
        />
      </View>

      {/* List */}
      <FlatList
        data={groupBy === 'none' ? users || [] : groupedData}
        keyExtractor={(item: any) => item.id || item.groupKey}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          if (groupBy !== 'none') {
            return (
              <View style={styles.group}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{item.groupLabel}</Text>
                  <View style={styles.groupCount}>
                    <Text style={styles.groupCountText}>{item.count}</Text>
                  </View>
                </View>
                {item.items.map(renderUser)}
              </View>
            );
          }
          return renderUser(item);
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No personnel found</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      {selectedUser && (
        <Modal
          visible={true}
          onClose={() => setSelectedUser(null)}
          title="Personnel Detail"
        >
          <View style={styles.detailHeader}>
            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.detailName}>{selectedUser.name}</Text>
            <View style={styles.detailBadges}>
              <Badge text={selectedUser.role} variant="info" />
              <Badge
                text={selectedUser.affiliation}
                variant={
                  selectedUser.affiliation === 'aramco' ? 'info' : 'default'
                }
              />
            </View>
          </View>

          <Card style={{ marginTop: 20 }}>
            <DetailRow
              icon="card"
              label="Badge"
              value={selectedUser.badgeNumber}
            />
            <DetailRow
              icon="business"
              label="Company"
              value={selectedUser.company || '-'}
            />
            <DetailRow
              icon="location"
              label="Zone"
              value={getZoneName(selectedUser.zoneId)}
            />
            {selectedUser.ecoSlot && (
              <DetailRow
                icon="shield"
                label="ECO Slot"
                value={selectedUser.ecoSlot}
              />
            )}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <Ionicons
                  name="pulse"
                  size={18}
                  color={colors.gray[400]}
                />
                <Text style={styles.detailLabel}>Status</Text>
              </View>
              <StatusIndicator status={selectedUser.responseStatus} />
            </View>
            <DetailRow
              icon="wifi"
              label="Online"
              value={selectedUser.isOnline ? 'Yes' : 'No'}
            />
            {selectedUser.currentLatitude && (
              <DetailRow
                icon="navigate"
                label="GPS"
                value={`${selectedUser.currentLatitude.toFixed(5)}, ${selectedUser.currentLongitude.toFixed(5)}`}
              />
            )}
          </Card>
        </Modal>
      )}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.left}>
        <Ionicons name={icon} size={18} color={colors.gray[400]} />
        <Text style={detailStyles.label}>{label}</Text>
      </View>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  groupControl: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  userSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  userBadge: {
    fontSize: 12,
    color: colors.gray[500],
  },
  userDot: {
    fontSize: 12,
    color: colors.gray[300],
  },
  userRole: {
    fontSize: 12,
    color: colors.gray[400],
    textTransform: 'capitalize',
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  group: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.gray[500],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  groupCount: {
    backgroundColor: colors.gray[200],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  groupCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    color: colors.gray[400],
    fontSize: 16,
    fontWeight: '500',
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  detailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailAvatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  detailName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  detailBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '600',
  },
});
